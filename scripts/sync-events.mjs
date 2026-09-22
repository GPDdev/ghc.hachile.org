import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const base = 'https://ghc.tongji.edu.cn/Chinese/sy/';
const decode = (value = '') => value
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&(amp|quot|apos|lt|gt|nbsp|ldquo|rdquo|lsquo|rsquo|middot);/g, (_, name) => ({
    amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ',
    ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', middot: '·',
  })[name])
  .replace(/\s+/g, ' ')
  .trim();

const classify = (title) => {
  if (/迎新|新生|军训/.test(title)) return '新生与迎新';
  if (/毕业|学位|院友/.test(title)) return '毕业与院友';
  if (/喜报|荣获|夺魁|冠军|亚军|竞赛|获奖|论文/.test(title)) return '学术与荣誉';
  if (/交流|调研|访问|合作|签署|共建/.test(title)) return '交流合作';
  if (/夜话|沙龙|读书|导师|朋辈|先锋队|加油站/.test(title)) return '书院生活';
  if (/晚会|歌会|音乐会|运动会|篮球|排球|体育|文化节/.test(title)) return '校园文化';
  if (/党|团|志愿|社会实践/.test(title)) return '党团与实践';
  if (/培养|教学|课程|专业|讲座|实验室/.test(title)) return '人才培养';
  return '书院动态';
};

const first = await fetch(`${base}sydt.htm`, { headers: { 'user-agent': 'ghc.hachile.org archive sync' } });
if (!first.ok) throw new Error(`首页请求失败：HTTP ${first.status}`);
const firstHtml = await first.text();
const pageCount = Number(firstHtml.match(/_gotopage_fun\((\d+)/)?.[1] || 40);
const urls = [`${base}sydt.htm`, ...Array.from({ length: pageCount - 1 }, (_, index) => `${base}sydt/${pageCount - 1 - index}.htm`)];

const pages = await Promise.all(urls.map(async (url, index) => {
  if (index === 0) return { url, html: firstHtml };
  const response = await fetch(url, { headers: { 'user-agent': 'ghc.hachile.org archive sync' } });
  if (!response.ok) throw new Error(`${url}：HTTP ${response.status}`);
  return { url, html: await response.text() };
}));

const entries = pages.flatMap(({ url, html }) => [...html.matchAll(/<li id="line_u4_[\s\S]*?<\/li>/g)].map(([item]) => {
  const day = item.match(/<time>[\s\S]*?<span>(\d{2})<\/span>[\s\S]*?<span><\/span>[\s\S]*?<span>(\d{2})-(\d{2})<\/span>/);
  const heading = item.match(/<h2 class="a-title"[^>]*title="([^"]*)"[\s\S]*?<a href="([^"]+)"/);
  if (!day || !heading) return null;
  const sourceUrl = new URL(decode(heading[2]), url).href;
  const title = decode(heading[1]);
  const summary = decode(item.match(/<p class="a-dis">([\s\S]*?)<\/p>/)?.[1] || '');
  return {
    id: createHash('sha1').update(`${day[2]}-${day[3]}-${day[1]}|${sourceUrl}`).digest('hex').slice(0, 12),
    date: `20${day[2]}-${day[3]}-${day[1]}`,
    title,
    summary,
    category: classify(title),
    confidence: '正史',
    source: sourceUrl,
  };
}).filter(Boolean));

const unique = [...new Map(entries.map((entry) => [`${entry.date}|${entry.title}|${entry.source}`, entry])).values()]
  .sort((a, b) => b.date.localeCompare(a.date));
const expected = Number(firstHtml.match(/共(\d+)条/)?.[1]);
if (!expected || unique.length !== expected) throw new Error(`抓取数量不符：预期 ${expected}，得到 ${unique.length}`);

await writeFile(new URL('../docs/events.json', import.meta.url), `${JSON.stringify({
  updated: new Date().toISOString().slice(0, 10),
  source: `${base}sydt.htm`,
  count: unique.length,
  events: unique,
}, null, 2)}\n`);
console.log(`已同步 ${unique.length} 条书院动态。`);
