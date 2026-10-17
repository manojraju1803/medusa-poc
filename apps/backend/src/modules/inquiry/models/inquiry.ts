import { model } from '@medusajs/framework/utils';

// Quote/sample requests, contact messages and supplier sign-ups from the
// storefront. One table: the demo only needs to capture them for the team.
const Inquiry = model.define('inquiry', {
  id: model.id({ prefix: 'inq' }).primaryKey(),
  type: model.enum(['quote_sample', 'contact', 'supplier_registration']),
  status: model.enum(['new', 'in_progress', 'closed']).default('new'),
  name: model.text(),
  email: model.text(),
  phone: model.text().nullable(),
  company: model.text().nullable(),
  message: model.text().nullable(),
  customer_id: model.text().nullable(),
  product_id: model.text().nullable(),
  variant_id: model.text().nullable(),
  quantity: model.number().nullable(),
  unit: model.text().nullable(),
  wants_quote: model.boolean().default(false),
  wants_sample: model.boolean().default(false),
  metadata: model.json().nullable(),
});

export default Inquiry;
