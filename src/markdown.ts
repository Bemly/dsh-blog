/* ═══════════════════════════════════════════════════════════
   markdown.ts — 轻量 Markdown → 结构化块（Canvas 真 TUI 排版用）
   输出 blocks：h/p/code/diff/quote/ul/ol/hr/table/mermaid/tex
   inline 输出 tokens：[{text, st, fg, href}]，st 复用 TUI.ST 位标志
   支持：标题/列表/引用/表格/代码块/diff/行内格式/链接/
   Mermaid 简化流图 / LaTeX 简化渲染
   ═══════════════════════════════════════════════════════════ */
import type { Block, ListItem, MarkdownApi, MermaidLine, Token } from './types.ts';
import { TUI } from './tui-core.ts';

const ST = TUI.ST;
const T = (): typeof TUI.THEME => TUI.THEME;

const esc = (s: string): string => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/** 行内解析 → tokens */
function inline(str: string): Token[] {
  const tokens: Token[] = [];
  const s = String(str);
  const push = (text: string, o?: { st?: number; fg?: string; href?: string }): void => {
    if (!text) return;
    tokens.push({ text, st: o?.st || 0, fg: o?.fg, href: o?.href });
  };

  const rx = /(`[^`]+`|\*\*[^*]+\*\*|~~[^~]+~~|\$[^$\n]+\$|!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|(^|[^*\w])\*([^*\s][^*]*?)\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(s)) !== null) {
    if (m.index > last) push(s.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('`')) push(tok.slice(1, -1), { fg: T().accent, st: ST.BOLD });
    else if (tok.startsWith('**')) push(tok.slice(2, -2), { st: ST.BOLD });
    else if (tok.startsWith('~~')) push(tok.slice(2, -2), { st: ST.DIM });
    else if (tok.startsWith('$')) push(tok.slice(1, -1), { fg: T().purple, st: ST.ITALIC });
    else if (tok.startsWith('![')) {
      const mm = tok.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      push(`🖼 ${mm?.[1] || mm?.[2] || ''}`, { fg: T().dim });
    } else if (tok.startsWith('[')) {
      const mm = tok.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (mm) push(mm[1], { fg: T().cyan, st: ST.UNDER, href: mm[2] });
    } else {
      // 斜体（含前导字符）
      if (m[1]) push(m[1]);
      if (m[2]) push(m[2], { st: ST.ITALIC });
    }
    last = m.index + tok.length;
  }
  if (last < s.length) push(s.slice(last));
  return tokens;
}

/** 主解析：文本 → blocks */
function parse(text: string): Block[] {
  const lines = String(text).replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;
  let listType: 'ul' | 'ol' | null = null;
  let listBuf: ListItem[] = [];

  const flushList = (): void => {
    if (listType !== null) {
      blocks.push({ type: listType, items: listBuf });
      listType = null;
      listBuf = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i] ?? '';

    // Mermaid（必须在通用代码块之前匹配）
    if (/^```mermaid/i.test(line)) {
      flushList();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i] ?? '')) buf.push(lines[i++] ?? '');
      i++;
      blocks.push({ type: 'mermaid', lines: parseMermaid(buf.join('\n')) });
      continue;
    }
    // 代码块
    if (/^```/.test(line)) {
      flushList();
      const lang = line.slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i] ?? '')) buf.push(lines[i++] ?? '');
      i++;
      const isDiff = /diff/i.test(lang);
      blocks.push({ type: isDiff ? 'diff' : 'code', lang: lang || (isDiff ? 'diff' : 'code'), lines: buf });
      continue;
    }
    // LaTeX 块
    if (/^\$\$/.test(line)) {
      flushList();
      const buf: string[] = [line.replace(/^\$\$\s*/, '')];
      i++;
      while (i < lines.length && !/^\$\$/.test(lines[i] ?? '')) buf.push(lines[i++] ?? '');
      i++;
      blocks.push({ type: 'tex', lines: buf });
      continue;
    }
    // 表格
    if (/^\s*\|/.test(line) && /^\s*\|[\s:|-]+\|/.test(lines[i + 1] ?? '')) {
      flushList();
      const rowsRaw: string[][] = [];
      while (i < lines.length && /^\s*\|/.test(lines[i] ?? '')) {
        const row = lines[i] ?? '';
        if (!/^\s*\|[\s:|-]+\|$/.test(row)) rowsRaw.push(row.split('|').slice(1, -1));
        i++;
      }
      if (rowsRaw.length === 0 || rowsRaw[0] === undefined) continue;
      blocks.push({
        type: 'table',
        head: (rowsRaw[0] ?? []).map(c => inline(c.trim())),
        rows: rowsRaw.slice(1).map(r => r.map(c => inline(c.trim()))),
      });
      continue;
    }
    // 独立图片行 → image 块（行内图片仍按占位符处理）
    const im = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/);
    if (im !== null && im[2] !== undefined) {
      flushList();
      blocks.push({ type: 'image', alt: im[1] ?? '', src: im[2] });
      i++;
      continue;
    }
    // 标题
    const hm = line.match(/^(#{1,6})\s+(.*)/);
    if (hm && hm[1] !== undefined) {
      flushList();
      blocks.push({ type: 'h', level: hm[1].length, tokens: inline(hm[2] ?? '') });
      i++;
      continue;
    }
    // 水平线
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      flushList();
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }
    // 引用
    if (/^>\s?/.test(line)) {
      flushList();
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i] ?? '')) {
        buf.push((lines[i] ?? '').replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'quote', tokens: inline(buf.join(' ')) });
      continue;
    }
    // 列表
    const ulm = line.match(/^\s*[-*+]\s+(.*)/);
    const olm = line.match(/^\s*(\d+)[.)]\s+(.*)/);
    if ((ulm ?? olm) !== null) {
      const type: 'ul' | 'ol' = olm ? 'ol' : 'ul';
      if (listType !== type) {
        flushList();
        listType = type;
        listBuf = [];
      }
      const raw = olm ? (olm[2] ?? '') : (ulm?.[1] ?? '');
      const index = olm ? parseInt(olm[1] ?? '0', 10) : 0;
      listBuf.push({ index, tokens: inline(raw.trim()) });
      i++;
      continue;
    }
    // 普通段落
    flushList();
    if (line.trim() === '') { i++; continue; }
    const para: string[] = [];
    while (i < lines.length) {
      const cur = lines[i] ?? '';
      if (cur.trim() === '') break;
      if (/^(#{1,6}\s|```|\$\$|>\s?|[-*+]\s|\d+[.)]\s|---\s*$)/.test(cur)) break;
      if (/^\s*\|/.test(cur)) break;
      para.push(cur);
      i++;
    }
    blocks.push({ type: 'p', tokens: inline(para.join(' ')) });
  }
  flushList();
  return blocks;
}

/**
 * Mermaid 简化：edge / node / raw
 * 支持 A --> B、A -- 标签 --> B，以及节点带方括号标签（A[输入事件]）
 */
function parseMermaid(code: string): MermaidLine[] {
  const out: MermaidLine[] = [];
  const lines = code.split('\n')
    .map(l => l.trim())
    .filter(l => l !== '' && !/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|gantt|pie|journey)\b/i.test(l));
  for (const line of lines) {
    if (line.includes('-->')) {
      const parts = line.split('-->');
      if (parts.length === 2) {
        let left = (parts[0] ?? '').trim();
        const right = (parts[1] ?? '').trim();
        let label = '';
        // A -- 标签 --> B：左段末尾带 --标签
        const lm = left.match(/^(.*?)\s*--\s*(.+?)\s*$/);
        if (lm && lm[1] !== undefined && lm[2] !== undefined) {
          left = lm[1].trim();
          label = lm[2].trim();
        }
        if (left && right) {
          out.push({ kind: 'edge', a: left, label, b: right });
          continue;
        }
      }
    }
    const node = line.match(/^([A-Za-z0-9_-]+)\s*\[(.*)\]$/);
    if (node && node[1] !== undefined) {
      out.push({ kind: 'node', a: node[1], label: node[2] ?? '' });
      continue;
    }
    out.push({ kind: 'raw', text: line });
  }
  return out;
}

export const MDKit: MarkdownApi = { parse, inline, esc };
