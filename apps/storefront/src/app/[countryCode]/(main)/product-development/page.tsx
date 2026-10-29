import { staticPageMetadata } from "@lib/util/seo"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Figure, H2, InfoLayout, P } from "@modules/info-pages/components/info-layout"

export const generateMetadata = staticPageMetadata({
  path: "/product-development",
  title: "Product Development",
  description:
    "New product development, R&D application support and product re-engineering for gummies, protein powders, drinks, bars and crispies.",
})

const SERVICES = [
  {
    title: "New product development",
    text: "New product development (NPD) is the process of bringing a new product to the marketplace. Your business may need it due to changing consumer preferences, increasing competition and advances in technology, or to capitalise on a new opportunity.",
  },
  {
    title: "R&D application support",
    text: "Rapidly changing consumption patterns and evolving customer expectations have changed the way products and services are delivered. The line between products and services is blurring with rising demand for \"as-a-service\" models, so there is an urgent need to adapt and integrate new technologies with products.",
  },
  {
    title: "Re-engineering old products",
    text: "Product re-engineering modifies an existing product, sometimes through reverse engineering, to optimise its performance by adding new functionality and taking advantage of emerging technologies, whether for a new business need, upgrading legacy products or keeping pace with competitors.",
  },
]

const CONSUMER_PROTEIN =
  "Ideal for supporting the health and well-being of the whole family, from children and women to adults: when you're growing, starting a workout programme, stepping up your workouts, recovering from an injury, or going vegan."

const FORMATS: { name: string; text?: string; consumer?: string; products: string[] }[] = [
  {
    name: "Gummies",
    text: "Gummies are a broad category of pectin- or carrageenan-based, fruit-based chewable sweets. They give a softer consistency and a more enjoyable chewing experience and flavour, with health benefits. Some gummy products are also made with starch.",
    consumer:
      "Gummies for adults are ideal for supporting the health and well-being of the whole family, from children aged 4 and over to adults. They are an easy and delicious way to get the essential vitamins and minerals you need daily.",
    products: [
      "Multivitamin gummies",
      "Multimineral gummies",
      "Extract gummies",
      "A.N.I. (active nutra ingredient) gummies",
      "Combination of multivitamins and minerals",
    ],
  },
  {
    name: "Protein Powder",
    text: "Protein is an essential part of your nutritional plan, whatever your goal. Our range delivers the complete solution, whether you're looking to gain size, build lean muscle or simply increase your daily protein intake.",
    consumer: CONSUMER_PROTEIN,
    products: [
      "General protein",
      "Clinical nutrition for women, kids and diabetics",
      "Sports protein supplements: mass gainer, lean muscle, pro, beginner, muscle support, pre-workout, post-workout",
      "Pure whey",
      "Vitamin capsules",
    ],
  },
  {
    name: "Protein Drink",
    text: "A type of sports drink commonly produced from whey, a bovine milk product, used to help recuperate fatigued or overly stressed muscles. It can be taken as a protein supplement after an intense workout, or any time to give your body the protein it needs.",
    consumer: CONSUMER_PROTEIN,
    products: ["High protein drink", "Flavoured drink", "High fibre protein drink"],
  },
  {
    // The original page repeated the Protein Drink copy here; only the
    // bar-specific items are kept.
    name: "Protein Bars",
    products: ["Vitamin-rich bar", "Mineral-rich bar"],
  },
  {
    name: "Protein Crispy",
    text: "Protein crispies are used as a protein supplement and are very useful for hitting daily protein targets. Stacked with protein, minerals, active nutra ingredients, antioxidants, omega-3s and fibre, they're much more than a snack: nutrition and energy that also increases muscle protein synthesis to break a fasted state.",
    products: [
      "High protein bar",
      "Rice protein crispy",
      "Pea protein crispy",
      "Soy protein crispy",
      "Whey protein crispy",
      "Meal replacement",
      "High fibre bar",
      "Active nutra ingredients bar",
    ],
  },
]

export default function ProductDevelopmentPage() {
  return (
    <InfoLayout
      title="Product Development"
      subtitle="From concept to finished product"
      current="/product-development"
    >
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {SERVICES.map((s) => (
          <section key={s.title} className="rounded-2xl border border-gray-100 p-5 border-t-4 border-t-[#7aba0c] odd:border-t-[#0077cf]">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#00356e] mb-2">{s.title}</h2>
            <p className="text-xs leading-relaxed text-[#475569]">{s.text}</p>
          </section>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr_280px] gap-6 items-center mb-4">
        <div>
          <H2>Formulated with active people in mind</H2>
          <P>
            Product formats specifically formulated to help achieve performance or
            nutritional goals.
          </P>
        </div>
        <Figure
          src="/pages/new-product-1.jpg"
          alt="Gummies, protein powder, protein drink, protein crispy and protein bar"
          className="aspect-square"
        />
      </div>

      <div className="space-y-4">
        {FORMATS.map((f) => (
          <section key={f.name} className="rounded-2xl border border-gray-100 p-5">
            <h3 className="text-lg font-extrabold text-[#0f172a] mb-2">{f.name}</h3>
            {f.text && <P>{f.text}</P>}
            {f.consumer && (
              <P>
                <strong className="text-[#4d7c0f]">Consumer-centric: </strong>
                {f.consumer}
              </P>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {f.products.map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 rounded-lg bg-[#eaf5fc] border border-[#cfe5f4] text-xs font-semibold text-[#0077cf]"
                >
                  {p}
                </span>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-6">
        <LocalizedClientLink
          href="/contact?subject=Product%20Development"
          className="inline-flex px-5 py-2.5 bg-[#4d7c0f] hover:bg-[#3f6212] text-white text-sm font-bold rounded-xl transition-colors"
        >
          Discuss a product idea
        </LocalizedClientLink>
      </div>
    </InfoLayout>
  )
}
