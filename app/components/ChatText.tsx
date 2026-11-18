import { Fragment, type ReactNode } from 'react';

/**
 * Renders the few Markdown things a chat answer uses: **bold**, *italic*, `code`,
 * [links](https://…), bare https:// links, "- " and "1. " lists, and # headings
 * (shown as bold text). It builds React elements, never HTML strings, so an answer
 * can't inject markup; links are limited to http(s) and mailto.
 */

const INLINE =
  /\*\*([^*\n]+?)\*\*|`([^`\n]+?)`|\[([^\]\n]+?)\]\(((?:https?:\/\/|mailto:)[^)\s]+)\)|(https?:\/\/[^\s<>()]+)|(?<![*\w])\*([^*\s][^*\n]*?)\*(?![*\w])/g;

function Link({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith('http');
  return (
    <a className="a" href={href} {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}>
      {children}
    </a>
  );
}

function inline(text: string, depth = 0): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const key = `${depth}-${k++}`;
    if (m[1] !== undefined) {
      out.push(<strong key={key}>{depth < 3 ? inline(m[1], depth + 1) : m[1]}</strong>);
    } else if (m[2] !== undefined) {
      out.push(<code key={key}>{m[2]}</code>);
    } else if (m[3] !== undefined) {
      out.push(<Link key={key} href={m[4]}>{m[3]}</Link>);
    } else if (m[5] !== undefined) {
      // Trailing punctuation belongs to the sentence, not the link.
      const url = m[5].replace(/[.,;:!?'"]+$/, '');
      out.push(<Link key={key} href={url}>{url}</Link>);
      if (url.length < m[5].length) out.push(m[5].slice(url.length));
    } else {
      out.push(<em key={key}>{m[6]}</em>);
    }
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Block =
  | { kind: 'p'; lines: string[] }
  | { kind: 'h'; text: string }
  | { kind: 'ul' | 'ol'; items: string[] };

function blocks(text: string): Block[] {
  const out: Block[] = [];
  let cur = null as Block | null; // reassigned inside push(), which TypeScript can't see
  const push = (b: Block) => {
    out.push(b);
    cur = b;
  };
  for (const raw of text.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      cur = null;
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^\s{0,3}#{1,6}\s+(.+)$/))) {
      push({ kind: 'h', text: m[1] });
      cur = null;
    } else if ((m = line.match(/^\s*[-*•]\s+(.+)$/))) {
      if (cur && cur.kind === 'ul') cur.items.push(m[1]);
      else push({ kind: 'ul', items: [m[1]] });
    } else if ((m = line.match(/^\s*\d+[.)]\s+(.+)$/))) {
      if (cur && cur.kind === 'ol') cur.items.push(m[1]);
      else push({ kind: 'ol', items: [m[1]] });
    } else if (cur && cur.kind === 'p') {
      cur.lines.push(line.trim());
    } else {
      push({ kind: 'p', lines: [line.trim()] });
    }
  }
  return out;
}

export default function ChatText({ text }: { text: string }) {
  return (
    <>
      {blocks(text).map((b, i) => {
        if (b.kind === 'h') return <p key={i}><strong>{inline(b.text)}</strong></p>;
        if (b.kind === 'p') {
          return (
            <p key={i}>
              {b.lines.map((l, j) => (
                <Fragment key={j}>
                  {j > 0 && <br />}
                  {inline(l)}
                </Fragment>
              ))}
            </p>
          );
        }
        const List = b.kind;
        return (
          <List key={i}>
            {b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}
          </List>
        );
      })}
    </>
  );
}
