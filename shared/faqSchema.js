export function faqSchema(faqs = []) {
  const rows = faqs.filter(faq => typeof faq?.question === 'string' && faq.question.trim() && typeof faq.answer === 'string' && faq.answer.trim());
  if (!rows.length) return null;
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: rows.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) };
}
export function serializeSchema(schema) {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}
