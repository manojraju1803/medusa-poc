import { Metadata } from "next"
import { notFound } from "next/navigation"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { InfoLayout, P } from "@modules/info-pages/components/info-layout"
import { BLOG_POSTS, formatPostDate } from "@modules/info-pages/lib/blog-posts"
import { pageMetadata, toMetaDescription } from "@lib/util/seo"

type Props = { params: Promise<{ slug: string; countryCode: string }> }

const findPost = (slug: string) => BLOG_POSTS.find((p) => p.slug === slug)

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug, countryCode } = await props.params
  const post = findPost(slug)
  if (!post) notFound()
  return pageMetadata({
    countryCode,
    path: `/blog/${post.slug}`,
    title: post.title,
    description:
      toMetaDescription(post.body[0]) ||
      `${post.title} - from the Ingredients Bazar blog.`,
    images: post.image ? [{ url: post.image, alt: post.title }] : undefined,
  })
}

export default async function BlogPostPage(props: Props) {
  const { slug } = await props.params
  const post = findPost(slug)
  if (!post) notFound()

  const index = BLOG_POSTS.indexOf(post)
  const prev = BLOG_POSTS[index + 1]
  const next = BLOG_POSTS[index - 1]

  return (
    // The banner carries the post title as the page h1 (one h1 per page).
    <InfoLayout title={post.title} subtitle="Our Blog" current="/blog">
      <LocalizedClientLink href="/blog" className="text-xs font-semibold text-[#0077cf] hover:underline">
        ← All posts
      </LocalizedClientLink>
      <div className="flex items-center gap-2 mt-4 mb-5 text-[10px] font-bold uppercase tracking-wider">
        <span className="px-2 py-0.5 rounded bg-[#eaf5fc] text-[#0077cf]">{post.category}</span>
        <time dateTime={post.date} className="text-[#94a3b8]">{formatPostDate(post.date)}</time>
      </div>

      {post.youtubeId ? (
        <div className="aspect-video mb-5 rounded-xl overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${post.youtubeId}?rel=0`}
            title={post.title}
            className="w-full h-full"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        post.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image} alt={post.title} className="w-full rounded-xl border border-gray-100 mb-5" />
        )
      )}

      <div className="max-w-3xl">
        {post.body.map((para) => (
          <P key={para}>{para}</P>
        ))}
        {post.extraImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.extraImage}
            alt={`${post.title} poster`}
            loading="lazy"
            className="mt-4 w-full max-w-md rounded-xl border border-gray-100"
          />
        )}
      </div>

      <nav aria-label="More posts" className="mt-8 pt-5 border-t border-gray-100 grid sm:grid-cols-2 gap-3 text-sm">
        {prev ? (
          <LocalizedClientLink href={`/blog/${prev.slug}`} className="rounded-xl border border-gray-100 p-3 hover:border-[#7aba0c]">
            <span className="block text-[10px] font-bold uppercase text-[#94a3b8]">Older</span>
            <span className="font-semibold text-[#0f172a]">{prev.title}</span>
          </LocalizedClientLink>
        ) : (
          <span />
        )}
        {next && (
          <LocalizedClientLink href={`/blog/${next.slug}`} className="rounded-xl border border-gray-100 p-3 text-right hover:border-[#7aba0c]">
            <span className="block text-[10px] font-bold uppercase text-[#94a3b8]">Newer</span>
            <span className="font-semibold text-[#0f172a]">{next.title}</span>
          </LocalizedClientLink>
        )}
      </nav>
    </InfoLayout>
  )
}
