import { Metadata } from "next"

import {
  Callout,
  H2,
  InfoLayout,
  P,
} from "@modules/info-pages/components/info-layout"

export const metadata: Metadata = {
  title: "Delivery Information | IngredientsBazar",
  description:
    "Same-day dispatch, shipping options, shipment tracking and V-Trans freight rates for Ingredients Bazar orders.",
}

const QUESTIONS = [
  {
    q: "Do you dispatch on the same day of order?",
    img: "/pages/1-1-1.jpg",
    a: [
      "Yes. Ordered items are dispatched on the same day if you place your order before 2 PM; our dispatch window runs from 10 AM to 2 PM. Orders placed after 2 PM are dispatched on the next working day. You can order from Monday to Saturday.",
    ],
  },
  {
    q: "What shipping options do you offer?",
    img: "/pages/2.jpg",
    a: [
      "Our logistics services are designed around each customer's needs, so you can pick the option that suits you:",
      "A. Self-pickup: collect the goods from our warehouse.",
      "B. Paid door delivery: we work with one of the best transport services (rates below). Charges follow docket size and zonal pricing. Irrespective of order volume, a fixed docket charge and insurance charge of ₹100 each apply; these are shown at checkout.",
    ],
  },
  {
    q: "How do I check the status of my shipment?",
    img: "/pages/3.jpg",
    a: [
      "You can check the status of your order after logging in to your account. Once your order has shipped, you will receive an email with tracking information so you can track your shipment live, 24/7.",
    ],
  },
  {
    q: "Can I use my own shipping account or PO number?",
    img: "/pages/4.jpg",
    a: [
      "Of course. If you would like to use your own authorised transporter or carrier, select Self Pick-Up and give your carrier's name and account number in the shipping instructions. For paid delivery, we will share the transporter details with delivery charges based on distance.",
    ],
  },
]

const RATES: [string, string, string][] = [
  ["A", "Rest of Karnataka", "4.50"],
  ["B", "Chennai", "4.00"],
  ["C", "Rest of Tamil Nadu, Pondicherry", "5.50"],
  ["D", "Hyderabad", "5.50"],
  ["E", "Rest of Andhra Pradesh", "6.00"],
  ["F", "Kerala", "6.00"],
  ["G", "Mumbai, Thane, Navi Mumbai", "6.50"],
  ["H", "Pune, Chinchwad, Pimpri", "6.00"],
  ["I", "Rest of Maharashtra (excluding Vidarbha) & Goa", "7.00"],
  ["J", "Ahmedabad", "7.00"],
  ["K", "Rest of Gujarat, Daman & Diu, Dadra & Nagar Haveli", "7.00"],
  ["L", "Vidarbha, Chhattisgarh & Madhya Pradesh", "8.00"],
  ["M", "Ghaziabad, Gurgaon, Faridabad, Noida", "8.00"],
  ["O", "Delhi", "7.30"],
  ["P", "Rest of Haryana, Rest of Uttar Pradesh & Rajasthan", "9.00"],
  ["Q", "Punjab, Chandigarh, Uttarakhand & Himachal Pradesh", "10.00"],
  ["R", "Jammu & Kashmir", "14.00"],
  ["S", "Kolkata", "10.00"],
  ["T", "Rest of West Bengal, Bihar, Jharkhand & Odisha", "10.00"],
  ["U", "Guwahati & North East", "15.00"],
]

export default function DeliveryInformationPage() {
  return (
    <InfoLayout
      title="Delivery Information"
      subtitle="User-defined delivery time, shipping options and freight rates"
      current="/delivery-information"
    >
      <div className="space-y-4">
        {QUESTIONS.map((item, i) => (
          <section
            key={item.q}
            className="grid sm:grid-cols-[1fr_200px] gap-4 items-center rounded-2xl border border-gray-100 p-4 sm:p-5"
          >
            <div>
              <h2 className="text-base font-bold text-[#0f172a] mb-2">
                <span className="text-[#4d7c0f]">Q{i + 1}.</span> {item.q}
              </h2>
              {item.a.map((para) => (
                <P key={para}>{para}</P>
              ))}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.img} alt="" loading="lazy" className="hidden sm:block w-full rounded-xl" />
          </section>
        ))}
      </div>

      <H2>V-Trans shipment charges</H2>
      <P>Price per kg, excluding GST.</P>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#00356e] text-white text-left">
              <th className="px-4 py-2.5 font-semibold w-20">Zone</th>
              <th className="px-4 py-2.5 font-semibold">Destinations</th>
              <th className="px-4 py-2.5 font-semibold text-right whitespace-nowrap">Price (₹/kg)</th>
            </tr>
          </thead>
          <tbody>
            {RATES.map(([zone, dest, price]) => (
              <tr key={zone} className="border-t border-gray-100 even:bg-[#fafdf5]">
                <td className="px-4 py-2 font-bold text-[#4d7c0f]">{zone}</td>
                <td className="px-4 py-2 text-[#334155]">{dest}</td>
                <td className="px-4 py-2 text-right font-semibold text-[#0f172a]">{price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout>
        Minimum transport fare: any order of 40 kg or less is delivered anywhere
        in India at a flat ₹500, excluding docket and insurance charges.
      </Callout>
    </InfoLayout>
  )
}
