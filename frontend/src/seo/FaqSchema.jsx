import { faqSchema, serializeSchema } from '../../../shared/faqSchema.js';
export default function FaqSchema({ faqs }) {
  const schema = faqSchema(faqs);
  return schema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeSchema(schema) }} /> : null;
}
