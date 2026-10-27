import test from 'node:test';
import assert from 'node:assert/strict';
import { faqSchema, serializeSchema } from './faqSchema.js';
test('FAQ schema contains exactly the supplied visible questions and answers', () => {
  const faqs = [{ question: 'Which size?', answer: 'Check the frame width.' }];
  const schema = faqSchema(faqs);
  assert.equal(schema['@type'], 'FAQPage');
  assert.deepEqual(schema.mainEntity, [
    {
      '@type': 'Question',
      name: faqs[0].question,
      acceptedAnswer: { '@type': 'Answer', text: faqs[0].answer },
    },
  ]);
  assert.equal(faqSchema([]), null);
  assert.equal(faqSchema([{ question: '', answer: 'A' }]), null);
});
test('FAQ JSON-LD escapes script-breaking text without changing its data', () => {
  const schema = faqSchema([
    { question: '</script><script>alert(1)</script>', answer: 'Text & more' },
  ]);
  const json = serializeSchema(schema);
  assert.ok(!json.includes('<'));
  assert.deepEqual(JSON.parse(json), schema);
});
