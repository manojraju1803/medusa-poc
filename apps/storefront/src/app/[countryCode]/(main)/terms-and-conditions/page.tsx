import { staticPageMetadata } from "@lib/util/seo"

import { Callout, InfoLayout, P } from "@modules/info-pages/components/info-layout"

export const generateMetadata = staticPageMetadata({
  path: "/terms-and-conditions",
  title: "Terms & Conditions",
  description: "Terms and conditions of sale for Ingredients Bazar orders.",
})

const CLAUSES: { title: string; body: string[] }[] = [
  {
    title: "Agreement",
    body: [
      "These Terms and Conditions, the Seller's Purchase Order Confirmation and the Invoice constitute the entire agreement of the parties (\"Agreement\"). The Product(s) shall be deemed accepted if not refused or returned by the Buyer within 10 days of the Buyer's receipt. The Buyer shall conduct any required inspection at its expense and shall return any nonconforming goods to the Seller within the said 10-day period at the Buyer's expense and risk.",
    ],
  },
  {
    title: "Payment",
    body: [
      "All payments are processed through NEFT and RTGS bank transfers. ingredientsbazar.com does not store or share your credit/debit card information or billing information on its own servers, for security purposes. Payment of the Purchase Price is due and payable as set forth on the invoice. Any amounts unpaid and past due will be subject to a service charge on the unpaid balance at an interest rate equal to the lesser of 12% per annum or the maximum allowable interest rate under applicable law. The Buyer shall be responsible and liable for all expenses incurred by the Seller in collection, including reasonable lawyer's fees.",
    ],
  },
  {
    title: "Price",
    body: [
      "All prices are fixed as of the Purchase Order date and/or the Seller's Purchase Order Confirmation date. All prices quoted are exclusive of GST, taxes, fees, levies, duties, handling and freight charges (\"Taxes and Shipping Charges\") unless otherwise approved by the Seller.",
    ],
  },
  {
    title: "Return policy",
    body: [
      "All \"Special order\" product(s) must be prepaid before delivery and are non-returnable. All returns must first be authorised by the Seller's management. Returned goods must be accompanied by the Seller's Returned Materials Authorization Number (RMA Number), customer name and the original purchase order number. Returned material must be returned in its original packaging, form and quality. The Buyer assumes all liability for a product damaged in transit. All returns received for any reason other than quality will be subject to a minimum 20% restocking charge. All repackaging fees are non-refundable.",
    ],
  },
  {
    title: "No warranties",
    body: [
      "The Buyer acknowledges that (a) the Seller is a reseller or distributor of the products, (b) the Seller undertakes no inspection or investigation of the products, and (c) the products sold by the Seller are provided \"as is\". The Seller makes no representations or warranties, express or implied, with respect to the products, the components or ingredients, or the quality or uses thereof. The Seller disclaims all implied warranties, including without limitation any warranty of merchantability, fitness for a particular purpose or non-infringement. The Buyer further acknowledges that it is relying solely on its own inspection or investigation of the products, and on the warranty (if any) provided by the third-party manufacturer or supplier of the products.",
    ],
  },
  {
    title: "Risk of loss",
    body: [
      "Title to the Product and risk of loss pass from the Seller to the Buyer on shipment from the Seller's facility. Loss or damage that occurs during shipping is the Buyer's responsibility.",
    ],
  },
  {
    title: "Assignment",
    body: [
      "The Buyer shall not assign or otherwise transfer any of its rights or obligations under this Agreement without the prior written consent of the Seller.",
    ],
  },
  {
    title: "Limitation of liability",
    body: [
      "In no event shall the Seller be liable to the Buyer or any third party for special, non-compensatory, consequential, indirect, incidental, statutory or punitive damages of any kind (including, without limitation, lost profits, lost sales, lost revenue or loss of use) regarding, relating to or in connection with this Agreement, the performance or failure of performance of this Agreement, or the sale, use or handling of the products or any components or ingredients thereof, regardless of the form of action, whether in contract, tort, negligence, strict liability or otherwise. Notwithstanding anything to the contrary in this Agreement, the Seller's total aggregate liability to the Buyer for any claim, demand, action or proceeding regarding, relating to or in connection with this Agreement, the performance or failure of performance of this Agreement, or the sale, use or handling of the products or any components or ingredients thereof shall be limited to the aggregate purchase price paid by the Buyer to the Seller for the products to which such claim, demand, action or proceeding relates.",
    ],
  },
  {
    title: "Indemnification",
    body: [
      "The Buyer shall indemnify and hold harmless the Seller, and the third-party manufacturers and suppliers of the Products sold hereunder, from and against all losses, liabilities, damages and expenses (including without limitation attorneys' fees and costs) resulting from any claims, demands, actions and other proceedings to the extent resulting from, relating to or in connection with (a) the use, handling or storage of the Products or any components or ingredients thereof, or (b) any claim that the Products or any components or ingredients thereof, or the sale or use thereof, infringes, misappropriates or otherwise violates (or contributes to or induces the infringement, misappropriation or other violation of) the patent or other intellectual property rights of any person or entity, or violates or otherwise conflicts with any applicable law, regulation or court order.",
      "The Buyer acknowledges that the Seller is a distributor or seller of raw materials intended to be purchased for manufacture, research or similar purposes and not intended for sale directly to consumers. Accordingly, the Buyer will indemnify and hold harmless the Seller from any claim of damage or injury to a consumer resulting from a product containing the raw materials that are the subject of this Agreement.",
    ],
  },
  {
    title: "Delivery dates",
    body: [
      "All delivery dates are approximate and the Seller shall not be responsible for damages of any kind resulting from any delay. The Seller shall not be liable for any default or delay caused, directly or indirectly, by the elements, accidents, any governmental action, prohibition or regulation, shortage or inability to obtain or non-arrival or defect of any labour, material, ingredient or product used in the Product, failure of any party or third party to perform, or any other cause beyond the Seller's control (a \"Force Majeure Condition\", e.g. acts of God, natural disasters, war). If a Force Majeure Condition interferes with the Seller's delivery of the Product such that the cost of the Product would exceed the Purchase Price, the Seller shall be under no obligation to deliver the Product unless the Buyer agrees to pay the additional costs.",
    ],
  },
  {
    title: "Termination",
    body: [
      "The Seller may terminate this Agreement if (a) a signed Purchase Order and/or a signed Purchase Order Confirmation is not received by the Seller within 5 working days of the Agreement date; or (b) the Buyer is unwilling or unable to accept delivery of the Product(s) on the delivery date and the parties are unable to agree on another delivery date.",
    ],
  },
  {
    title: "Compliance with applicable laws",
    body: [
      "The Buyer shall be solely responsible for the use, handling and storage of the Products or any components or ingredients thereof, and the Seller shall have no responsibility therefor. The Buyer shall use, handle and store the Products or any components or ingredients thereof at all times in strict accordance with all applicable laws, regulations and court orders, and shall not infringe, misappropriate or otherwise violate (or contribute to or induce the infringement, misappropriation or other violation of) the patent or other intellectual property rights of any person or entity. Without limiting the foregoing, the Buyer shall be solely responsible for determining whether the Seller has any and all licences, registrations, approvals and other authorisations from governmental authorities and/or third parties necessary for the purchase by the Buyer, or the use, handling and storage, of the Products or any components or ingredients thereof, and the Seller shall have no responsibility or liability therefor.",
    ],
  },
  {
    title: "Conflicting terms",
    body: [
      "All Purchase Orders accepted by the Buyer shall be subject to the Seller's Terms and Conditions of Sale stated herein, which may be changed or amended from time to time by the Seller. Any terms and conditions presented in orders placed by the Buyer that conflict with this Agreement shall be inapplicable to the sale without the express written waiver of the Seller's Terms and Conditions of Sale. Acceptance of an order or shipment of Product(s) shall not be deemed acceptance of any conflicting or additional terms and conditions.",
    ],
  },
  {
    title: "Miscellaneous",
    body: [
      "(a) Enforcement: The Buyer shall be responsible and liable for all costs incurred by the Seller in enforcing its rights and the Buyer's obligations under this Agreement, including reasonable attorney's fees.",
      "(b) Binding effect: This Agreement shall be binding upon and inure to the benefit of the parties, their respective successors, legal representatives and permitted assignees.",
      "(c) Governing law: This Agreement shall be governed by and construed under the laws of India, without regard to conflicts of law rules. Any cause of action that may arise in any way under this Agreement shall be brought exclusively in the Indian jurisdiction.",
      "(d) Notices: All notices required to be given shall be in writing and delivered to the address set forth on the Purchase Order by hand, by certified first-class mail (postage prepaid, return receipt requested), or by confirmed fax or e-mail, and shall be deemed given on the date hand delivered or three days after mailing or sending.",
      "(e) Severability: The invalidity or unenforceability of any provision of this Agreement shall not affect any other provision, which shall remain in full force and effect. If any provision is held invalid or unenforceable, it shall be construed as valid and enforceable by limiting it as to time, subject or scope as required under applicable law.",
      "(f) No waiver: All rights and remedies of the Seller are cumulative and not exclusive, and the exercise of any remedy shall not be deemed a waiver of any other right or remedy. No term or condition of this Agreement shall be deemed waived by the Seller, nor shall there be any estoppel against the Seller, except by written consent of the Seller.",
      "(g) Limitations: Any suit or other action based on breach of this Agreement or any other claim arising from the Product(s) (other than an action by the Seller for amounts due to the Seller) must be commenced within one year from the date of tender for delivery by the Seller.",
    ],
  },
]

export default function TermsPage() {
  return (
    <InfoLayout
      title="Terms & Conditions"
      subtitle="Terms and conditions of sale"
      current="/terms-and-conditions"
    >
      <ol className="space-y-5">
        {CLAUSES.map((c, i) => (
          <li key={c.title} className="flex gap-4">
            <span className="w-8 h-8 shrink-0 rounded-lg bg-[#f6fbee] border border-[#d9edb8] text-[#4d7c0f] text-xs font-extrabold flex items-center justify-center">
              {i + 1}
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#00356e] mb-1.5 mt-1">
                {c.title}
              </h2>
              {c.body.map((para) => (
                <P key={para}>{para}</P>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <Callout>
        Minimum transport fare: irrespective of the ingredients purchased, any
        order of 40 kg or less delivered anywhere in India is charged a flat
        fixed rate of ₹500, excluding docket and insurance charges.
      </Callout>
    </InfoLayout>
  )
}
