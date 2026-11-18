import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ChatText from './ChatText';

const html = (text: string) => renderToStaticMarkup(<ChatText text={text} />);

describe('ChatText', () => {
  it('renders bold, italic and code', () => {
    expect(html('He uses **Spring Boot**, *Angular* and `Qdrant`.')).toBe(
      '<p>He uses <strong>Spring Boot</strong>, <em>Angular</em> and <code>Qdrant</code>.</p>',
    );
  });

  it('renders lists and paragraphs', () => {
    expect(html('Skills:\n- Java\n- C#\n\n1. One\n2. Two')).toBe(
      '<p>Skills:</p><ul><li>Java</li><li>C#</li></ul><ol><li>One</li><li>Two</li></ol>',
    );
  });

  it('shows a heading as bold text, not a heading', () => {
    expect(html('## Projects')).toBe('<p><strong>Projects</strong></p>');
  });

  it('keeps single line breaks inside a paragraph', () => {
    expect(html('one\ntwo')).toBe('<p>one<br/>two</p>');
  });

  it('links https and mailto, opening web links in a new tab', () => {
    expect(html('[GitHub](https://github.com/x) and [mail](mailto:a@b.co)')).toBe(
      '<p><a class="a" href="https://github.com/x" target="_blank" rel="noreferrer noopener">GitHub</a> and <a class="a" href="mailto:a@b.co">mail</a></p>',
    );
  });

  it('linkifies bare URLs but leaves the trailing full stop outside', () => {
    expect(html('See https://example.com/a.')).toBe(
      '<p>See <a class="a" href="https://example.com/a" target="_blank" rel="noreferrer noopener">https://example.com/a</a>.</p>',
    );
  });

  it('never turns markup or script links into elements', () => {
    const out = html('<img src=x onerror=alert(1)> [x](javascript:alert(1)) [y](data:text/html,<b>) <script>alert(1)</script>');
    expect(out).not.toMatch(/<img|<script|<b>/);
    expect(out).not.toContain('href="javascript');
    expect(out).not.toContain('href="data');
    expect(out).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('leaves an unfinished marker alone while the answer is still streaming', () => {
    expect(html('The key is **Spring')).toBe('<p>The key is **Spring</p>');
  });

  it('does not treat a lone asterisk or a product like 2*3*4 as italic', () => {
    expect(html('2*3*4 and 5 * 6')).toBe('<p>2*3*4 and 5 * 6</p>');
  });
});
