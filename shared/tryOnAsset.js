export const isGlbAsset = value => /\.glb(?:[?#]|$)/i.test(value || '');

// Only self-contained GLB 2 models: no external downloads or decoder dependencies.
export function inspectGlb(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 20 || view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2 || view.getUint32(8, true) !== bytes.length || view.getUint32(16, true) !== 0x4e4f534a) throw new Error('Choose a valid GLB 2.0 model.');
  const length = view.getUint32(12, true);
  if (length > bytes.length - 20) throw new Error('The GLB file is incomplete.');
  let cursor = 12;
  while (cursor < bytes.length) {
    if (cursor + 8 > bytes.length) throw new Error('The GLB file is incomplete.');
    const chunkLength = view.getUint32(cursor, true);
    if (chunkLength % 4 || cursor + 8 + chunkLength > bytes.length) throw new Error('The GLB file is incomplete.');
    cursor += 8 + chunkLength;
  }
  const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + length)).trim());
  if (json.asset?.version !== '2.0' || !json.meshes?.length) throw new Error('The GLB must contain a glasses model.');
  if ([...(json.buffers || []), ...(json.images || [])].some(item => item.uri && !item.uri.startsWith('data:'))) throw new Error('Use a self-contained GLB with embedded textures.');
  const supported = new Set(['KHR_materials_unlit', 'KHR_materials_clearcoat', 'KHR_materials_transmission', 'KHR_materials_ior', 'KHR_materials_specular', 'KHR_materials_volume', 'KHR_materials_emissive_strength', 'KHR_materials_sheen', 'KHR_materials_iridescence', 'KHR_materials_anisotropy', 'KHR_texture_transform', 'KHR_mesh_quantization', 'EXT_mesh_gpu_instancing']);
  if ((json.extensionsRequired || []).some(name => !supported.has(name))) throw new Error('Export an uncompressed GLB with embedded PNG/JPEG textures.');
  return json;
}
