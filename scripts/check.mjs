import { readFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = await readFile(join(root, 'seed', 'manifest.txt'), 'utf8');
const entries = manifest
  .split(/\r?\n/)
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => line.split('|'));

const titles = new Set();
const files = new Set();
for (const [title, file, extra] of entries) {
  if (!title || !file || extra !== undefined) throw new Error(`清单格式错误：${title ?? ''}`);
  if (titles.has(title) || files.has(file)) throw new Error(`清单存在重复项：${title}`);
  titles.add(title);
  files.add(file);
  await access(join(root, 'seed', 'pages', file));
}

if (!titles.has('首页') || !titles.has('MediaWiki:Common.css')) {
  throw new Error('清单缺少首页或站点样式');
}

console.log(`检查通过：${entries.length} 个初始页面。`);

