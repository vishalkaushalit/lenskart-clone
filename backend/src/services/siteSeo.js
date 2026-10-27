export const escapeXml = value => String(value).replace(/[<>&"']/g, char => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&apos;' }[char]));
export function verificationToken(value, name) {
  if (typeof value !== 'string' || value.length > 2000) throw new Error('Enter a verification token or meta tag.');
  let token = value.trim();
  if (token.startsWith('<')) {
    if (!/^<meta\s+[^<>]+\/?\s*>$/i.test(token)) throw new Error('Use only the verification meta tag.');
    const attributes = Object.fromEntries([...token.matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)].map(match => [match[1].toLowerCase(), match[2]]));
    if (attributes.name !== name || !attributes.content) throw new Error(`Use the ${name} tag.`);
    token = attributes.content;
  }
  if (token && !/^[\w-]{1,500}$/.test(token)) throw new Error('The verification token contains invalid characters.');
  return token;
}
export function siteSeoFields(body) {
  const fields = {};
  let url = body.websiteUrl;
  if (typeof url !== 'string' || url.length > 2000) throw new Error('Enter your website URL.');
  if (url.trim()) {
    const parsed = new URL(url.trim());
    if (!['http:','https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) throw new Error('Use the website origin only, such as https://example.com.');
    url = parsed.origin;
  }
  fields.websiteUrl = url.trim();
  fields.googleVerification = verificationToken(body.googleVerification || '', 'google-site-verification');
  fields.metaVerification = verificationToken(body.metaVerification || '', 'facebook-domain-verification');
  for (const [key, max] of [['sitemap',200000],['robots',100000]]) {
    if (typeof body[key] !== 'string' || body[key].length > max) throw new Error(`${key} is too large or is not text.`);
    fields[key] = body[key].trim();
  }
  if (fields.sitemap && (!/^\s*(?:<\?xml[^>]*>\s*)?<(urlset|sitemapindex)\b[\s\S]*<\/(urlset|sitemapindex)>\s*$/.test(fields.sitemap) || /<!DOCTYPE|<!ENTITY|<script/i.test(fields.sitemap))) throw new Error('Upload a sitemap XML file with a urlset or sitemapindex root, without scripts or document entities.');
  if (fields.robots && (/<[^>]+>/.test(fields.robots) || !/^\s*user-agent\s*:/im.test(fields.robots))) throw new Error('robots.txt must be plain text with a User-agent directive.');
  return fields;
}
export function verificationHtml(settings) {
  return [['google-site-verification',settings.googleVerification],['facebook-domain-verification',settings.metaVerification]].filter(([,token]) => token).map(([name,token]) => `<meta name="${name}" content="${escapeXml(token)}" />`).join('\n');
}
