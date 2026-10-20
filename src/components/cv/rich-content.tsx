import { sanitizePostHtml } from '@/lib/validation';
import ReactMarkdown from 'react-markdown';

/** Keep CMS HTML formatting; older plain Markdown remains readable without a client parser. */
export function RichContent({ content }: { content: string }) {
  if (!content.trim()) return null;
  if (!/<\/?[a-z][\s\S]*>/i.test(content)) return <ReactMarkdown>{content}</ReactMarkdown>;
  const html = sanitizePostHtml(content)
    .replace(/<(\/?)(h1)(\s|>)/gi, '<$1h2$3')
    .replace(/<img\b([^>]*?)>/gi, (_tag, attributes: string) => '<img ' + attributes.replace(/\sloading\s*=\s*["'][^"']*["']/gi, '') + ' loading="lazy" decoding="async">');
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
