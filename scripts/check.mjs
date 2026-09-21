import { readFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = ['index.html', 'styles.css', 'app.js', 'data.json', 'CNAME', '.nojekyll'];
await Promise.all(requiredFiles.map((file) => access(join(root, 'docs', file))));

const data = JSON.parse(await readFile(join(root, 'docs', 'data.json'), 'utf8'));
const slugs = new Set();
for (const entry of data.entries) {
  if (!entry.slug || !entry.title || !entry.summary || !entry.kind) throw new Error(`条目字段不完整：${entry.slug ?? '未知'}`);
  if (slugs.has(entry.slug)) throw new Error(`条目 slug 重复：${entry.slug}`);
  slugs.add(entry.slug);
  for (const source of entry.sources) new URL(source.url);
}

if (data.entries.filter((entry) => entry.year).length < 10) throw new Error('初始史料条目不足');
if (data.featured.some((slug) => !slugs.has(slug))) throw new Error('首页推荐指向不存在的条目');
if ((await readFile(join(root, 'docs', 'CNAME'), 'utf8')).trim() !== 'ghc.hachile.org') throw new Error('CNAME 配置错误');

console.log(`检查通过：${data.entries.length} 个页面，GitHub Pages 配置完整。`);
