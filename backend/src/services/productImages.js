import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
export function imageExtension(buffer) {
  if (!Buffer.isBuffer(buffer)) return null;
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'png';
  if (buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return 'jpg';
  if (buffer.length >= 12 && buffer.toString('ascii',0,4) === 'RIFF' && buffer.toString('ascii',8,12) === 'WEBP') return 'webp';
  return null;
}
export async function uploadProductImage(req, res, next) {
  const extension = imageExtension(req.body);
  if (!extension) return res.status(400).json({ message: 'Upload a JPEG, PNG, or WebP image.' });
  try {
    const name = `${randomUUID()}.${extension}`;
    if (process.env.VERCEL || process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
      const blob = await put(`products/${name}`, req.body, { access: 'public', contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}` });
      return res.status(201).json({ success: true, image: blob.url });
    }
    const directory = fileURLToPath(new URL('../../public/products/', import.meta.url));
    await mkdir(directory, { recursive: true });
    await writeFile(`${directory}${name}`, req.body, { flag: 'wx' });
    res.status(201).json({ success: true, image: `/assets/products/${name}` });
  } catch (error) { next(error); }
}
