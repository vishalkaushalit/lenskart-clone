import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectGlb, isGlbAsset } from '../../../shared/tryOnAsset.js';
import { createImageUploadHandler } from './productImages.js';
function glb(fields = {}) {
  const json = JSON.stringify({
    asset: { version: '2.0' },
    meshes: [{ primitives: [] }],
    ...fields,
  });
  const length = Math.ceil(Buffer.byteLength(json) / 4) * 4;
  const buffer = Buffer.alloc(20 + length, 32);
  buffer.writeUInt32LE(0x46546c67, 0);
  buffer.writeUInt32LE(2, 4);
  buffer.writeUInt32LE(buffer.length, 8);
  buffer.writeUInt32LE(length, 12);
  buffer.writeUInt32LE(0x4e4f534a, 16);
  buffer.write(json, 20);
  return buffer;
}
const response = () => ({
  status(code) {
    this.code = code;
    return this;
  },
  json(body) {
    this.body = body;
  },
});
test('GLB validation rejects malformed, external and unsupported compressed assets', () => {
  assert.equal(inspectGlb(glb()).asset.version, '2.0');
  for (const buffer of [
    Buffer.from('fake.glb'),
    glb().subarray(0, 21),
    glb({ meshes: [] }),
    glb({ buffers: [{ uri: 'https://example.com/buffer.bin' }] }),
    glb({ images: [{ uri: '../texture.png' }] }),
    glb({ extensionsRequired: ['KHR_draco_mesh_compression'] }),
  ])
    assert.throws(() => inspectGlb(buffer));
  assert.equal(isGlbAsset('https://example.com/frame.GLB?download=1'), true);
  assert.equal(isGlbAsset('https://example.com/frame.png'), false);
});
test('try-on uploader stores GLB with the model MIME type; gallery uploader rejects it', async () => {
  let uploads = 0;
  const handler = createImageUploadHandler({
    tryOn: true,
    env: { BLOB_READ_WRITE_TOKEN: 'test' },
    upload: async (name, body, options) => {
      uploads++;
      assert.match(name, /\.glb$/);
      assert.equal(options.contentType, 'model/gltf-binary');
      assert.equal(body, bytes);
      return { url: `https://example.com/${name}` };
    },
  });
  const bytes = glb();
  const res = response();
  await handler({ body: bytes, headers: { 'x-file-name': 'Frame.glb' } }, res);
  assert.equal(res.code, 201);
  assert.equal(uploads, 1);
  const gallery = response();
  await createImageUploadHandler()({ body: bytes }, gallery);
  assert.equal(gallery.code, 400);
  for (const body of [Buffer.from('invalid'), Buffer.from([255, 216, 255])]) {
    const invalid = response();
    await handler({ body }, invalid);
    assert.equal(invalid.code, 400);
  }
  assert.equal(uploads, 1);
});
test('try-on uploader preserves PNG/WebP support and does not require GLB', async () => {
  const handler = createImageUploadHandler({
    tryOn: true,
    env: { BLOB_READ_WRITE_TOKEN: 'test' },
    upload: async (name, body, options) => {
      assert.match(options.contentType, /^image\/(png|webp)$/);
      return { url: `https://example.com/${name}` };
    },
  });
  for (const body of [
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    Buffer.from('RIFF0000WEBP'),
  ]) {
    const res = response();
    await handler({ body }, res);
    assert.equal(res.code, 201);
  }
});
