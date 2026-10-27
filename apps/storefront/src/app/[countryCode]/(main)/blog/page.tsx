import { staticPageMetadata } from "@lib/util/seo"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { InfoLayout } from "@modules/info-pages/components/info-layout"
import { BLOG_POSTS, formatPostDate } from "@modules/info-pages/lib/blog-posts"

export const generateMetadata = staticPageMetadata({
  path: "/blog",
  title: "Our Blog",
  description: "News, magazine features and updates from Ingredients Bazar.",
})

export default function BlogPage() {
  return (
    <InfoLayout
      title="Our Blog"
      subtitle="How we came this far"
      current="/blog"
    >
      <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {BLOG_POSTS.map((post) => (
          <li key={post.slug}>
            <LocalizedClientLink
              href={`/blog/${post.slug}`}
              className="group h-full flex flex-col rounded-2xl border-2 border-[#e6f2d6] overflow-hidden bg-white hover:border-[#7aba0c] hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="aspect-[1200/628] bg-gradient-to-br from-[#00356e] to-[#4d7c0f] overflow-hidden">
                {post.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.image}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center px-4 text-center text-lg font-extrabold text-white/90">
                    {post.title}
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                  <span className="px-2 py-0.5 rounded bg-[#eaf5fc] text-[#0077cf]">{post.category}</span>
                  <time dateTime={post.date} className="text-[#94a3b8]">
                    {formatPostDate(post.date)}
                  </time>
                </div>
                <h2 className="mt-2 text-sm font-bold text-[#0f172a] group-hover:text-[#4d7c0f] transition-colors leading-snug">
                  {post.title}
                </h2>
                {post.body[0] && (
                  <p className="mt-1.5 text-xs leading-relaxed text-[#64748b] line-clamp-3">{post.body[0]}</p>
                )}
                <span className="mt-auto pt-3 text-xs font-bold text-[#4d7c0f]">
                  {post.youtubeId ? "Watch video" : "Read more"} →
                </span>
              </div>
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </InfoLayout>
  )
}
