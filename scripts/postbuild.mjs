// After `vite build`: publish the app's HTML as dist/app.html.
// On Vercel, dist/index.html is removed so that "/" is not a static file:
// vercel.json can then send link-preview crawlers to /api/og (fresh meta
// tags) and everyone else to /app.html. Locally index.html is kept so
// `vite preview` keeps working.
import { copyFileSync, rmSync, existsSync } from 'node:fs';

const src = 'dist/index.html';
if (!existsSync(src)) {
  console.error('postbuild: dist/index.html not found');
  process.exit(1);
}
copyFileSync(src, 'dist/app.html');
if (process.env.VERCEL) rmSync(src);
console.log(`postbuild: dist/app.html written${process.env.VERCEL ? ', dist/index.html removed (Vercel)' : ''}`);
