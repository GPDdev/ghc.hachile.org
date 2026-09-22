import { readFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = ['index.html', 'styles.css', 'app.js', 'data.json', 'events.json', 'favicon.png', 'operator.jpg', 'institution-light.png', 'institution-dark.png', 'CNAME', '.nojekyll'];
await Promise.all(requiredFiles.map((file) => access(join(root, 'docs', file))));

const data = JSON.parse(await readFile(join(root, 'docs', 'data.json'), 'utf8'));
const eventData = JSON.parse(await readFile(join(root, 'docs', 'events.json'), 'utf8'));
const slugs = new Set();
for (const entry of data.entries) {
  if (!entry.slug || !entry.title || !entry.summary || !entry.kind || !entry.confidence || !entry.confidenceNote) throw new Error(`条目字段不完整：${entry.slug ?? '未知'}`);
  if (slugs.has(entry.slug)) throw new Error(`条目 slug 重复：${entry.slug}`);
  slugs.add(entry.slug);
  for (const source of entry.sources) new URL(source.url);
}

if (data.entries.filter((entry) => entry.year).length < 15) throw new Error('史料条目不足');
if (data.featured.some((slug) => !slugs.has(slug))) throw new Error('首页推荐指向不存在的条目');
if (data.timeline.some((slug) => !slugs.has(slug))) throw new Error('时间线指向不存在的条目');
if (eventData.count !== eventData.events.length || eventData.events.length < 199) throw new Error('官网事件未完整同步');
const eventIds = new Set();
for (const event of eventData.events) {
  if (!event.id || !event.date || !event.title || !event.category || event.confidence !== '正史') throw new Error(`事件字段不完整：${event.id ?? '未知'}`);
  if (eventIds.has(event.id)) throw new Error(`事件 ID 重复：${event.id}`);
  eventIds.add(event.id);
  new URL(event.source);
}
if ((await readFile(join(root, 'docs', 'CNAME'), 'utf8')).trim() !== 'ghc.hachile.org') throw new Error('CNAME 配置错误');

console.log(`检查通过：${data.entries.length} 篇专题，${eventData.events.length} 条官网事件，GitHub Pages 配置完整。`);
