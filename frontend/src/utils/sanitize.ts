import DOMPurify from 'dompurify';

/**
 * 净化 HTML 字符串，防止 XSS 攻击。
 * 使用 DOMPurify 移除所有危险标签和属性，仅保留安全的 HTML。
 *
 * @param html - 待净化的 HTML 字符串
 * @returns 净化后的安全 HTML 字符串
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'br', 'b', 'i', 'em', 'strong', 'a', 'p', 'div', 'span',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * 将纯文本中的 HTML 特殊字符转义，安全地显示用户输入。
 *
 * @param text - 用户输入的纯文本
 * @returns HTML 转义后的安全字符串
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}
