import test from 'node:test';
import assert from 'node:assert/strict';
import { frameSizing } from './frameSizing.js';
test('frame proportions use front-width ranges rather than lens or temple length', () => {
  assert.equal(frameSizing('S').width, 124.5);
  assert.equal(frameSizing('M').factor, 1);
  assert.equal(frameSizing('L').width, 141.5);
  assert.equal(frameSizing('XL').width, 146);
  assert.equal(frameSizing('XL').label, '146 mm and above');
  assert.ok(frameSizing('S').factor < frameSizing('M').factor);
  assert.ok(frameSizing('L').factor < frameSizing('XL').factor);
  assert.equal(frameSizing('XS').factor, 1);
  assert.equal(frameSizing(undefined).label, '');
});

test('saved fit compares against each front-width range including rounding boundaries', async () => {
  const { compareFrameFit } = await import('./frameSizing.js');
  assert.equal(compareFrameFit('M', 133.5), 'Estimated fit');
  assert.match(compareFrameFit('S', 133.5), /narrower/);
  assert.match(compareFrameFit('XL', 133.5), /wider/);
  assert.equal(compareFrameFit('XL', 152), 'Estimated fit');
  assert.equal(compareFrameFit('M', 137.4), 'Estimated fit');
  assert.equal(compareFrameFit('XS', 120), null);
  assert.equal(compareFrameFit('M', NaN), null);
});

test('size labels consistently include supplied mm ranges without changing size values', async () => {
  const { formatFrameSize } = await import('./frameSizing.js');
  assert.equal(formatFrameSize('S'), 'S (120–129 mm)');
  assert.equal(formatFrameSize('XL'), 'XL (146 mm and above)');
  assert.equal(formatFrameSize('XS'), 'XS');
  assert.equal(formatFrameSize('M/L'), 'M/L');
});
