import test from 'node:test';
import assert from 'node:assert/strict';
import { verificationToken, siteSeoFields, verificationHtml } from './siteSeo.js';
import { adminSiteSeo } from '../routes/siteSeoRoutes.js';
import { requireAuth } from '../middleware/auth.js';
const empty={websiteUrl:'https://example.com',googleVerification:'',metaVerification:'',sitemap:'',robots:''};
test('site settings writes require an admin session',()=>{
  assert.equal(adminSiteSeo.stack[0].handle,requireAuth);
  let code;
  adminSiteSeo.stack[1].handle({user:{role:'customer'}},{status(value){code=value;return this;},json(){}},()=>assert.fail('customer allowed'));
  assert.equal(code,403);
});
test('verification accepts tokens and known meta tags without executing HTML',()=>{
  assert.equal(verificationToken('<meta name="google-site-verification" content="abc_123-xyz" />','google-site-verification'),'abc_123-xyz');
  assert.equal(verificationToken('meta123','facebook-domain-verification'),'meta123');
  assert.throws(()=>verificationToken('<script>alert(1)</script>','google-site-verification'));
  assert.throws(()=>verificationToken('<meta name="other" content="abc">','google-site-verification'));
  assert.equal(verificationHtml({googleVerification:'abc',metaVerification:'xyz'}),'<meta name="google-site-verification" content="abc" />\n<meta name="facebook-domain-verification" content="xyz" />');
  assert.ok(!verificationHtml({googleVerification:'"<script>'}).includes('content=""<'));
});
test('crawler files and origins are validated and can be cleared',()=>{
  assert.equal(siteSeoFields({...empty,websiteUrl:'https://example.com/'}).websiteUrl,'https://example.com');
  assert.equal(siteSeoFields({...empty,sitemap:'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',robots:'User-agent: *\nAllow: /'}).robots,'User-agent: *\nAllow: /');
  for(const fields of [{websiteUrl:'javascript:alert(1)'},{websiteUrl:'https://example.com/path'},{sitemap:'<!DOCTYPE xml><urlset></urlset>'},{sitemap:'<script></script>'},{robots:'<html>bad</html>'},{robots:'x'.repeat(100001)}])assert.throws(()=>siteSeoFields({...empty,...fields}));
  assert.equal(siteSeoFields(empty).sitemap,'');
});

test('generated robots and sitemap use the saved origin and active product slugs', async t => {
  const { default: SiteSeo }=await import('../models/SiteSeo.js');
  const { default: Product }=await import('../models/Product.js');
  const { publicSiteSeo }=await import('../routes/siteSeoRoutes.js');
  t.mock.method(SiteSeo,'findOne',()=>({async lean(){return {websiteUrl:'https://shop.example.com'};}}));
  t.mock.method(Product,'find',filter=>{
    assert.deepEqual(filter,{status:'active'});
    return {select(){return this;},limit(){return this;},async lean(){return [{slug:'test-frame',updatedAt:new Date('2026-10-27T00:00:00Z')}];}};
  });
  const response=()=>({type(value){this.contentType=value;return this;},set(){return this;},send(body){this.body=body;return this;}});
  const handler=path=>publicSiteSeo.stack.find(layer=>layer.route?.path===path).route.stack[0].handle;
  const robots=response();await handler('/robots.txt')({},robots);
  assert.equal(robots.contentType,'text/plain');
  assert.ok(robots.body.includes('Sitemap: https://shop.example.com/sitemap.xml'));
  const sitemap=response();await handler('/sitemap.xml')({},sitemap);
  assert.equal(sitemap.contentType,'application/xml');
  assert.ok(sitemap.body.includes('https://shop.example.com/products/test-frame'));
  assert.ok(!sitemap.body.includes('/checkout'));
});
test('custom crawler files are served without querying the product catalog', async t=>{
  const { default: SiteSeo }=await import('../models/SiteSeo.js');
  const { publicSiteSeo }=await import('../routes/siteSeoRoutes.js');
  t.mock.method(SiteSeo,'findOne',()=>({async lean(){return {sitemap:'<urlset></urlset>',robots:'User-agent: *\nDisallow: /'};}}));
  for(const [path,expected] of [['/sitemap.xml','<urlset></urlset>'],['/robots.txt','User-agent: *\nDisallow: /']]) {
    let body;
    await publicSiteSeo.stack.find(layer=>layer.route?.path===path).route.stack[0].handle({}, {type(){return this;},set(){return this;},send(value){body=value;}});
    assert.equal(body,expected);
  }
});

test('Google tracking validates installation method and public IDs',()=>{
  assert.equal(siteSeoFields({...empty,trackingMode:'gtm',gtmId:'GTM-ABC123'}).gtmId,'GTM-ABC123');
  assert.equal(siteSeoFields({...empty,trackingMode:'direct',ga4Id:'G-ABC123',googleAdsId:'AW-12345'}).googleAdsId,'AW-12345');
  for(const fields of [{trackingMode:'script'},{trackingMode:'gtm'},{trackingMode:'direct'},{trackingMode:'gtm',gtmId:'<script>alert(1)</script>'},{trackingMode:'direct',ga4Id:'AW-123'}])assert.throws(()=>siteSeoFields({...empty,...fields}));
  assert.equal(siteSeoFields({...empty,trackingMode:'off'}).trackingMode,'off');
});

test('health endpoint does not intercept the storefront homepage',async()=>{
  const {default:app}=await import('../server.js');
  const routes=app.router.stack.filter(layer=>layer.route).map(layer=>layer.route.path);
  assert.ok(routes.includes('/api/health'));
  assert.ok(!routes.some(path=>path==='/'||Array.isArray(path)&&path.includes('/')));
});
test('homepage HTML keeps the app and includes escaped crawlable fallback links',async()=>{
  const {storefrontHtml}=await import('./siteSeo.js');
  const html=storefrontHtml('<html><head></head><body><div id="root"></div><script src="/assets/app.js"></script></body></html>',{googleVerification:'abc'},[{path:'/collection',label:'Collection'},{path:'/products/test-frame',label:'Frame <test>'}]);
  assert.ok(html.includes('<meta name="google-site-verification" content="abc" />'));
  assert.ok(html.includes('<a href="/collection">Collection</a>'));
  assert.ok(html.includes('<a href="/products/test-frame">Frame &lt;test&gt;</a>'));
  assert.ok(html.includes('<noscript>'));
  assert.ok(html.includes('<div id="root"></div>'));
  assert.ok(html.includes('<script src="/assets/app.js"></script>'));
});
