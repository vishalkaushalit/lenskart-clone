import { execFileSync } from 'node:child_process';
import { cp, mkdir, rm } from 'node:fs/promises';

// Force deployment routing even when checking the combined build locally.
const env = { ...process.env, VERCEL: '1', VITE_API_URL: '', VITE_ADMIN_URL: '', VITE_FRONTEND_URL: '' };
for (const directory of ['frontend', 'web-panel']) {
  execFileSync('npm', ['run', 'build', '--prefix', directory], { stdio: 'inherit', env });
}
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('frontend/dist', 'dist', { recursive: true });
await cp('web-panel/dist', 'dist/admin', { recursive: true });
await cp('backend/public/products', 'dist/assets/products', { recursive: true });
