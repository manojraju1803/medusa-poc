import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Skeleton,
  Text,
  toast,
} from "@medusajs/ui"
import { useEffect, useRef, useState } from "react"
import { HeroSlide } from "../../../api/utils/hero-slides"

const ACCEPT = "image/jpeg,image/png,image/webp"
const MAX_BYTES = 10 * 1024 * 1024

const api = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body?.message ?? `Request failed (${res.status})`)
  return body as T
}

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "")
    reader.onerror = () => reject(new Error("Couldn't read the file."))
    reader.readAsDataURL(file)
  })

const SlideCard = ({
  number,
  slide,
  defaultImage,
  uploading,
  disabled,
  onPick,
  onAlt,
  onReset,
}: {
  number: number
  slide: HeroSlide
  defaultImage: string
  uploading: boolean
  disabled: boolean
  onPick: (file: File) => void
  onAlt: (alt: string) => void
  onReset: () => void
}) => {
  const input = useRef<HTMLInputElement>(null)
  const custom = !!slide.image_url
  return (
    <Container className="flex flex-col gap-y-3 px-6 py-4">
      <div className="flex items-center justify-between gap-2">
        <Text size="small" weight="plus">
          Slide {number}
        </Text>
        <Badge size="2xsmall" color={custom ? "green" : "grey"}>
          {custom ? "Custom image" : "Default image"}
        </Badge>
      </div>
      <img
        src={slide.image_url ?? defaultImage}
        alt=""
        className="aspect-[16/7] w-full rounded-md border border-ui-border-base bg-ui-bg-subtle object-cover"
      />
      <div className="flex flex-col gap-y-1">
        <Label size="small" htmlFor={`alt-${number}`}>
          Description for screen readers
        </Label>
        <Input
          id={`alt-${number}`}
          size="small"
          placeholder="Leave empty for the default description"
          value={slide.alt ?? ""}
          maxLength={200}
          disabled={disabled}
          onChange={(e) => onAlt(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <input
          ref={input}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ""
            if (file) onPick(file)
          }}
        />
        <Button
          size="small"
          variant="secondary"
          isLoading={uploading}
          disabled={disabled}
          onClick={() => input.current?.click()}
        >
          Replace image
        </Button>
        {custom && (
          <Button size="small" variant="transparent" disabled={disabled} onClick={onReset}>
            Use default
          </Button>
        )}
      </div>
    </Container>
  )
}

/**
 * Changes the three rotating images at the top of the storefront's homepage.
 * Images upload through POST /admin/site-images: compressed like product
 * images, but without the watermark.
 */
const HeroSlidesPage = () => {
  const [saved, setSaved] = useState<HeroSlide[] | null>(null)
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [defaults, setDefaults] = useState<string[]>([])
  const [uploading, setUploading] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api<{ slides: HeroSlide[]; defaults: string[] }>("/admin/hero-slides")
      .then((res) => {
        setSaved(res.slides)
        setSlides(res.slides)
        setDefaults(res.defaults)
      })
      .catch((e: Error) => setError(e.message))
  }, [])

  const update = (index: number, change: Partial<HeroSlide>) =>
    setSlides((current) => current.map((s, i) => (i === index ? { ...s, ...change } : s)))

  const upload = async (index: number, file: File) => {
    if (!ACCEPT.split(",").includes(file.type)) {
      toast.error("Upload a JPEG, PNG or WebP image.")
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error("The image can be at most 10 MB.")
      return
    }
    setUploading(index)
    try {
      const { files } = await api<{ files: { id: string; url: string }[] }>(
        "/admin/site-images",
        {
          method: "POST",
          body: JSON.stringify({
            files: [{ filename: file.name, content: await fileToBase64(file) }],
          }),
        }
      )
      update(index, { image_url: files[0].url, image_key: files[0].id })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't upload the image.")
    } finally {
      setUploading(null)
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await api<{ slides: HeroSlide[] }>("/admin/hero-slides", {
        method: "POST",
        body: JSON.stringify({
          slides: slides.map((s) => ({ ...s, alt: s.alt?.trim() || null })),
        }),
      })
      setSaved(res.slides)
      setSlides(res.slides)
      toast.success("Hero slides saved. The homepage shows them straight away.")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save the slides.")
    } finally {
      setSaving(false)
    }
  }

  const changed = JSON.stringify(slides) !== JSON.stringify(saved)

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex flex-col gap-y-1">
          <Heading level="h1">Hero slides</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            The three rotating images at the top of the homepage. Images are
            compressed like product images but don't get the watermark. JPEG,
            PNG or WebP, up to 10 MB; a wide image works best.
          </Text>
        </div>
        <Button size="small" disabled={!changed || uploading !== null} isLoading={saving} onClick={save}>
          Save
        </Button>
      </Container>

      {error ? (
        <Container className="px-6 py-4">
          <Text size="small" className="text-ui-fg-error">
            Couldn't load the slides: {error}
          </Text>
        </Container>
      ) : !saved ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          {slides.map((slide, i) => (
            <SlideCard
              key={i}
              number={i + 1}
              slide={slide}
              defaultImage={defaults[i]}
              uploading={uploading === i}
              disabled={saving || uploading !== null}
              onPick={(file) => upload(i, file)}
              onAlt={(alt) => update(i, { alt })}
              onReset={() => update(i, { image_url: null, image_key: null, alt: null })}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Hero slides",
})

export default HeroSlidesPage
