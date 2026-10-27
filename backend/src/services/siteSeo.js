export const escapeXml = (value) =>
  String(value).replace(
    /[<>&"']/g,
    (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char],
  );
export function verificationToken(value, name) {
  if (typeof value !== 'string' || value.length > 2000)
    throw new Error('Enter a verification token or meta tag.');
  let token = value.trim();
  if (token.startsWith('<')) {
    if (!/^<meta\s+[^<>]+\/?\s*>$/i.test(token))
      throw new Error('Use only the verification meta tag.');
    const attributes = Object.fromEntries(
      [...token.matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)].map((match) => [
        match[1].toLowerCase(),
        match[2],
      ]),
    );
    if (attributes.name !== name || !attributes.content) throw new Error(`Use the ${name} tag.`);
    token = attributes.content;
  }
  if (token && !/^[\w-]{1,500}$/.test(token))
    throw new Error('The verification token contains invalid characters.');
  return token;
}
export function siteSeoFields(body) {
  const fields = {};
  for (const key of ['productPrefix', 'collectionPrefix']) {
    if (Object.hasOwn(body, key)) {
      const value = body[key];
      if (typeof value !== 'string' || !/^\/[a-z][a-z0-9-]{0,59}$/.test(value))
        throw new Error(
          'Use a prefix such as /products with lowercase letters, numbers and hyphens.',
        );
      if (
        [
          '/api',
          '/admin',
          '/assets',
          '/orders',
          '/thank-you',
          '/eyeglasses',
          '/wishlist',
          '/cart',
          '/checkout',
          '/profile',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
        ].includes(value)
      )
        throw new Error('This prefix is reserved for another page.');
      fields[key] = value;
    }
  }
  if (Object.hasOwn(body, 'redirects')) {
    if (!Array.isArray(body.redirects) || body.redirects.length > 200)
      throw new Error('Add up to 200 redirects.');
    const paths = new Set();
    fields.redirects = body.redirects.map((row) => {
      if (
        !row ||
        ['from', 'to'].some(
          (key) =>
            typeof row[key] !== 'string' ||
            row[key].length > 300 ||
            !/^\/(?:[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*)?$/.test(row[key]) ||
            /^\/(api|admin|assets)(?:\/|$)/.test(row[key]),
        )
      )
        throw new Error(
          'Redirects must use local page paths, without query parameters or file extensions.',
        );
      if (row.from === '/' || row.from === row.to || paths.has(row.from))
        throw new Error(
          'Use a unique old URL different from the destination; the homepage cannot be redirected.',
        );
      paths.add(row.from);
      return { from: row.from, to: row.to };
    });
    for (const row of fields.redirects) {
      const visited = new Set([row.from]);
      let target = row.to;
      while (paths.has(target)) {
        if (visited.has(target)) throw new Error('Redirects cannot form a loop.');
        visited.add(target);
        target = fields.redirects.find((item) => item.from === target).to;
      }
    }
  }
  let url = body.websiteUrl;
  if (typeof url !== 'string' || url.length > 2000) throw new Error('Enter your website URL.');
  if (url.trim()) {
    const parsed = new URL(url.trim());
    if (
      !['http:', 'https:'].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password ||
      parsed.pathname !== '/' ||
      parsed.search ||
      parsed.hash
    )
      throw new Error('Use the website origin only, such as https://example.com.');
    url = parsed.origin;
  }
  fields.websiteUrl = url.trim();
  fields.googleVerification = verificationToken(
    body.googleVerification || '',
    'google-site-verification',
  );
  fields.metaVerification = verificationToken(
    body.metaVerification || '',
    'facebook-domain-verification',
  );
  for (const [key, max] of [
    ['sitemap', 200000],
    ['robots', 100000],
  ]) {
    if (typeof body[key] !== 'string' || body[key].length > max)
      throw new Error(`${key} is too large or is not text.`);
    fields[key] = body[key].trim();
  }
  if (
    fields.sitemap &&
    (!/^\s*(?:<\?xml[^>]*>\s*)?<(urlset|sitemapindex)\b[\s\S]*<\/(urlset|sitemapindex)>\s*$/.test(
      fields.sitemap,
    ) ||
      /<!DOCTYPE|<!ENTITY|<script/i.test(fields.sitemap))
  )
    throw new Error(
      'Upload a sitemap XML file with a urlset or sitemapindex root, without scripts or document entities.',
    );
  if (
    fields.robots &&
    (/<[^>]+>/.test(fields.robots) || !/^\s*user-agent\s*:/im.test(fields.robots))
  )
    throw new Error('robots.txt must be plain text with a User-agent directive.');
  if (Object.hasOwn(body, 'trackingMode')) {
    if (!['off', 'gtm', 'direct'].includes(body.trackingMode))
      throw new Error('Choose a supported tracking method.');
    fields.trackingMode = body.trackingMode;
    for (const [key, pattern] of [
      ['gtmId', /^GTM-[A-Z0-9]+$/],
      ['ga4Id', /^G-[A-Z0-9]+$/],
      ['googleAdsId', /^AW-[0-9]+$/],
    ]) {
      const value = body[key] ?? '';
      if (typeof value !== 'string' || value.length > 40 || (value && !pattern.test(value)))
        throw new Error(`Enter a valid ${key}, not a script snippet.`);
      fields[key] = value;
    }
    if (fields.trackingMode === 'gtm' && !fields.gtmId)
      throw new Error('Enter your GTM container ID.');
    if (fields.trackingMode === 'direct' && !fields.ga4Id && !fields.googleAdsId)
      throw new Error('Enter a GA4 or Google Ads ID.');
  }
  return fields;
}
export function verificationHtml(settings) {
  return [
    ['google-site-verification', settings.googleVerification],
    ['facebook-domain-verification', settings.metaVerification],
  ]
    .filter(([, token]) => token)
    .map(([name, token]) => `<meta name="${name}" content="${escapeXml(token)}" />`)
    .join('\n');
}

export function storefrontHtml(html, settings, links) {
  const fallback = `<noscript><nav aria-label="Store pages"><h1>Lenskart Clone</h1><p>Enable JavaScript for shopping, or browse these page links.</p><ul>${links.map((link) => `<li><a href="${escapeXml(link.path)}">${escapeXml(link.label)}</a></li>`).join('')}</ul><a href="/sitemap.xml">Sitemap</a></nav></noscript>`;
  return html
    .replace('</head>', `${verificationHtml(settings)}\n</head>`)
    .replace('</body>', `${fallback}\n</body>`);
}
