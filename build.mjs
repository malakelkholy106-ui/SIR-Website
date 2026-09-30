import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = resolve('SIR-Final-Website');
const output = resolve('dist');
const publicFiles = [
  'index.html',
  'admin.html',
  'style.css',
  'admin.css',
  'app.js',
  'admin.js',
  'supabase-client.js',
  'supabase-config.js',
  'robots.txt',
  'sitemap.xml'
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of publicFiles) {
  await cp(resolve(source, file), resolve(output, file));
}

await cp(resolve(source, 'assets'), resolve(output, 'assets'), { recursive: true });