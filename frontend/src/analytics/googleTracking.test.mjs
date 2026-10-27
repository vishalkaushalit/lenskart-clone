import test from 'node:test';
import assert from 'node:assert/strict';
function environment(t){
 const oldWindow=globalThis.window,oldDocument=globalThis.document;
 const scripts=[];
 globalThis.window={location:{origin:'https://shop.example.com'}};
 globalThis.document={getElementById:id=>scripts.find(script=>script.id===id),createElement:()=>({}),head:{appendChild:script=>scripts.push(script)}};
 t.after(()=>{globalThis.window=oldWindow;globalThis.document=oldDocument;});
 return scripts;
}
test('disabled tracking does not load external scripts',async t=>{
 const scripts=environment(t);
 const tracking=await import('./googleTracking.js?disabled');
 tracking.installGoogleTracking({trackingMode:'off'});tracking.trackGooglePage('/');
 assert.equal(scripts.length,0);
});
test('direct tracking loads once and sends deduplicated page views',async t=>{
 const scripts=environment(t);
 const tracking=await import('./googleTracking.js?direct');
 const settings={trackingMode:'direct',ga4Id:'G-ABC123',googleAdsId:'AW-12345'};
 tracking.installGoogleTracking(settings);tracking.installGoogleTracking(settings);
 tracking.trackGooglePage('/');tracking.trackGooglePage('/');tracking.trackGooglePage('/collection');
 assert.equal(scripts.length,1);
 const events=window.dataLayer.filter(row=>row[0]==='event');
 assert.equal(events.length,2);
 assert.equal(events[1][2].page_location,'https://shop.example.com/collection');
});
test('GTM uses its container and custom navigation event',async t=>{
 const scripts=environment(t);
 const tracking=await import('./googleTracking.js?gtm');
 tracking.installGoogleTracking({trackingMode:'gtm',gtmId:'GTM-ABC123',ga4Id:'G-ABC'});
 tracking.trackGooglePage('/');
 assert.equal(scripts.length,1);
 assert.ok(scripts[0].src.includes('/gtm.js?id=GTM-ABC123'));
 assert.equal(window.dataLayer.at(-1).event,'store_page_view');
 assert.equal(window.gtag,undefined);
});
