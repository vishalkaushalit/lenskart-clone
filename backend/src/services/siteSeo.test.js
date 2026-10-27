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
