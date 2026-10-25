// Posts from the original www.ingredientsbazar.com blog (WordPress REST API,
// fetched 2026-10-19). Images are copies kept under /public/pages/blog.

export type BlogPost = {
  slug: string
  title: string
  date: string
  category: "Social" | "Magazine" | "Brochure" | "Video"
  image?: string
  body: string[]
  extraImage?: string
  youtubeId?: string
}

const img = (name: string) => `/pages/blog/${name}`

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "customized-blend",
    title: "Customized Blend",
    date: "2018-10-23",
    category: "Social",
    body: [
      "It can be hard to make your business stand out from the crowd in today's busy digital marketplace. You know that you need to grow your online audience and find ways to connect with your target consumers, but with so many marketing channels to choose from, you may have difficulty deciding the best course of action. Have you ever thought about ingredientsbazar.com?",
      "At Ingredientsbazar.com, we have the capability to solve your business's most complex challenges, help you take your business to the next level and bring new products from concept to reality.",
    ],
  },
  {
    slug: "dasara-2018",
    title: "Dasara 2018",
    date: "2018-10-23",
    category: "Social",
    body: [
      "There is a wave of enthusiasm and liveliness in the air in the streets of India during the festival of Dussehra. Dussehra is one of the popular festivals of Hindus but is celebrated and attended by the followers of every other religion as well. There are family and community get-togethers on this day. Dussehra is celebrated on Dashmi (the tenth day) and follows a nine-day Hindu festival devoted to different human forms of a Devi (Goddess). All ten days are filled with the pure spirit of festivity, with carnivals and fairs organised all around the country.",
      "We at ingredientsbazar.com have come together to celebrate the victory of good over evil.",
    ],
  },
  {
    slug: "dussehra-2018",
    title: "Dussehra 2018",
    date: "2018-10-23",
    category: "Social",
    image: img("fb-banner-1-3.jpg"),
    body: [
      "Dussehra is an important festival in India for Hindus. All corners of the country are sparked with enthusiasm for the festive season. Dussehra is also known as “Dashmi”, denoted by the word “Ten”. It follows the nine-day festival of Navratri, during which nine forms of Devi / Shakti (Hindu Goddess) are worshipped around the country with slightly different rituals. Twenty days after Dussehra falls Deepavali, which also holds major significance in the country. Visiting India in October or November is a blessing for those who want to embrace Indian culture at its best.",
      "Hidden over open sourcing. Chaos over clarity sourcing. Tension over freedom sourcing.",
    ],
  },
  {
    slug: "magazine-september-month-ingredients-south-asia",
    title: "Magazine September month – Ingredients South Asia",
    date: "2018-10-15",
    category: "Magazine",
    image: img("brochure1-1.jpg"),
    extraImage: img("brochure-724x1024.jpg"),
    body: [
      "Ingredientsbazar's second post in Asia's elite magazine, Ingredients South Asia.",
      "Ingredients South Asia is read by CEOs as well as department heads from R&D, Purchase, Production, QA/QC, Regulatory Compliance, Hygiene & Sanitation Management, Legislation, Distribution, Logistics, Marketing & Sales and General Management across the Generics / API Manufacturing, Health Ingredients and Fine & Speciality Chemicals industry across India. Secondary segments include government and independent research labs, regulatory authorities, distributors, traders, research institutes, academia, allied suppliers, consultants and equity analysts who track the sector.",
      "Ingredients South Asia (ISA) is India's only B2B fortnightly, and Ingredientsbazar.com is proud to present the second poster.",
    ],
  },
  {
    slug: "our-usp",
    title: "Our USP",
    date: "2018-10-15",
    category: "Social",
    image: img("fb-banner-1.jpg"),
    body: [
      "ingredientsbazar.com (the next generation multi-brand ingredients platform) is India's first online multi-brand ingredients marketplace: an exclusive B2B e-commerce marketplace that could revolutionise today's nutritional raw materials.",
      "A unique selling proposition (USP) is a factor that differentiates a product from its traditional alternatives. Ingredientsbazar's USP over traditional sourcing is slab-wise pricing, comparison, live inventory and much more, the first product of its kind.",
      "Our USP: digital sourcing.",
    ],
  },
  {
    slug: "independence-day",
    title: "Independence Day",
    date: "2018-10-15",
    category: "Social",
    image: img("independence-day-2.jpg"),
    body: [
      "This Independence Day, let's celebrate the freedom of sourcing multi-brand ingredients, all under one roof.",
    ],
  },
  {
    slug: "register-today",
    title: "Register Today",
    date: "2018-10-15",
    category: "Social",
    image: img("register-1.jpg"),
    body: [
      "It is with great pleasure that we invite you to register for INGREDIENTS BAZAR.COM, to explore more on ingredients, brands, slab-wise pricing, stock availability and price comparison.",
      "India's first of its kind online portal.",
    ],
  },
  {
    slug: "engineers-day",
    title: "Engineers Day",
    date: "2018-10-15",
    category: "Social",
    image: img("engineers-day-1.jpg"),
    body: [
      "Mokshagundam Visvesvaraya (1860–1962) was a prominent Indian engineer, scholar, visionary and public official. He played an important role in many civil engineering and public works projects across undivided India.",
      "Team ingredientsbazar.com follows the footprint of Sir M. Visvesvaraya, as in his words: “Progress in every country depends mainly on the education of its people. Without education, we are a nation of children. The difference between one man and another, apart from birth and social position, consists in the extent of knowledge, general and practical, acquired by him. We may safely assume that man in all countries within certain limits start with the same degree of intelligence. A civilized nation is distinguished from an uncivilized one by the extent of its acquired intelligence and skill.”",
      "Ingredientsbazar salutes the most celebrated Indian engineer across the globe, Mokshagundam Visvesvaraya.",
    ],
  },
  {
    slug: "ganesh-chaturthi",
    title: "Ganesh Chaturthi",
    date: "2018-10-15",
    category: "Social",
    image: img("ganesha.jpg"),
    body: [
      "Ingredientsbazar has always believed in Lord Ganesha as the God of New Beginnings and the Remover of Obstacles, as well as the god of wisdom and intelligence.",
      "As the Ganapati shlok bestows in our hearts: Wakra tunda mahakay surya koti sama prabha, Nirwighnam kurume dewo sarwa karye shu sarwada.",
      "May Lord Ganesha give you a rainbow for every storm, a smile for every tear, a promise for every care and an answer to every prayer!",
      "Happy Ganesh Chaturthi from team ingredientsbazar.",
    ],
  },
  {
    slug: "navratri",
    title: "Navratri",
    date: "2018-10-15",
    category: "Social",
    image: img("navratri.jpg"),
    body: [
      "Navratri is celebrated for different reasons and in different ways across India. In the East and many places in Northeast India, Navratri is observed as Durga Puja, signifying the victory of Goddess Durga over the demon Mahishasura. In the North and Western states, Navratri is celebrated with ‘Ram Lila’ performances and the burning of effigies of Ravana, signifying Lord Ram's victory over Ravana. The final day of Navratri in North India is called Dussehra, and in the East, Vijay Dashami. The overarching theme of Navratri is the victory of good over evil, and the nine days are also a major crop-season cultural event.",
      "Team ingredientsbazar believes Navratri is a journey from the outer world of names and forms to the subtle world of energies; to the innermost core of our being, the Self.",
    ],
  },
  {
    slug: "about-us-video",
    title: "About Us",
    date: "2018-10-15",
    category: "Video",
    image: img("video.jpg"),
    youtubeId: "ebqMjMYTpLg",
    body: [],
  },
  {
    slug: "pamphlet",
    title: "Pamphlet",
    date: "2018-10-15",
    category: "Brochure",
    image: img("1-1220x651.jpg"),
    extraImage: img("pamphlet-21-08-2018-1.jpg"),
    body: [
      "Since its launch over 12 years ago, Fi India & Hi has been the only B2B event in the Indian subcontinent for the food and health ingredients, processing and packaging industry. The event offers industry leaders the opportunity to source high-quality ingredients, network with professional peers and expand their market share.",
      "Over 10,000 attendees and more than 500 exhibitors made the Fi India & Hi 2018 edition in Delhi-NCR the biggest show to date.",
    ],
  },
  {
    slug: "booklet",
    title: "Booklet",
    date: "2018-10-13",
    category: "Brochure",
    image: img("Ingredientsbazar-1a-1220x636.jpg"),
    body: [
      "Ingredientsbazar's first brochure builds awareness and understanding of India's first online multi-brand ingredients sourcing organisation, giving a high-level overview of its progression of programmes and its impact on sourcing needs.",
    ],
  },
  {
    slug: "magazine-debut-august-month-ingredients-south-asia",
    title: "Magazine debut – August month, Ingredients South Asia",
    date: "2018-10-13",
    category: "Magazine",
    image: img("fb-banner-1-2.jpg"),
    body: [
      "Ingredientsbazar is glad to announce its first magazine debut in Asia's elite magazine, Ingredients South Asia.",
      "Ingredients South Asia is read by CEOs as well as department heads from R&D, Purchase, Production, QA/QC, Regulatory Compliance, Hygiene & Sanitation Management, Legislation, Distribution, Logistics, Marketing & Sales and General Management across the Generics / API Manufacturing, Health Ingredients and Fine & Speciality Chemicals industry across India. Secondary segments include government and independent research labs, regulatory authorities, distributors, traders, research institutes, academia, allied suppliers, consultants and equity analysts who track the sector.",
      "Ingredients South Asia (ISA) is India's only B2B fortnightly, and Ingredientsbazar.com is proud to present the debut poster.",
    ],
  },
  {
    slug: "sourced-globally-delivered-locally",
    title: "Sourced Globally. Delivered Locally",
    date: "2018-10-13",
    category: "Social",
    image: img("sourced-1.jpg"),
    body: [
      "Digital India is a campaign launched by the Government of India to make government services available to citizens electronically, through improved online infrastructure, increased internet connectivity and digital empowerment in technology.",
      "Digital India has three core components: (a) development of secure and stable digital infrastructure, (b) delivering government services digitally, and (c) universal digital literacy.",
      "Team ingredientsbazar has taken a big step forward to transform ingredient sourcing into a digitally empowered knowledge economy.",
    ],
  },
]

export const formatPostDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
