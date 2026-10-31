# Product image watermark

The IngredientsBazar logo is burned into product images: into every image
uploaded through `POST /admin/uploads` (the admin's product screens), and, by a
script, into the images that existed before. Every image is also compressed,
and stored only if it ends up at 500 KB or less.

Images for the site itself, such as hero slides and blog covers, upload through a
separate route that compresses them the same way but never adds the logo; see
[Site images](#site-images-no-watermark).

## What it looks like

The logo sits in the image's top-left corner at 70% opacity. Its width is 20% of
the image's shorter side, with a gap of 3% from the edges, so it fits square,
tall and wide images. The image keeps its format (JPEG stays JPEG, PNG keeps its
transparency). Photos that a phone stored sideways, with a rotation flag, are
turned upright first, so the logo lands in the right corner.

To change the corner, size or opacity, edit the constants at the top of
`apps/backend/src/api/utils/watermark.ts`. Already watermarked images keep the
old look; see [Limitations](#limitations).

## Compression and the 500 KB limit

Each image is saved at the best of these settings that comes out at 500 KB or
less (1 KB = 1024 bytes), trying them in this order:

| Longest side | Quality (JPEG, WebP, AVIF) |
|---|---|
| up to 2000 px | 80, then 70, then 60 |
| up to 1600 px | 80, then 70, then 60 |
| up to 1200 px | 80, then 70, then 60 |

Images are never enlarged: a 600×600 image stays 600×600. If none of the
settings fits, the upload is rejected and nothing in it is stored. The
storefront shows images at most about 1000 px wide, so 1200–2000 px leaves room
for zooming.

- **JPEG and WebP in practice always fit.** In testing, even pure noise, the
  hardest image to compress, fitted as a JPEG at 1600 px and quality 60
  (475 KB). A 4000×3000 photo of seeds (4.3 MB) became 2000×1500 at 480 KB.
- **PNG can be rejected.** PNG is compressed without loss, so only the size
  steps apply. A large PNG photo can stay over 500 KB even at 1200 px; the
  message then suggests saving it as JPEG or WebP. PNG graphics with flat
  colours, logos and transparent cut-outs are small and fit easily.

To change the limit or the steps, edit `MAX_IMAGE_KB`, `SIZES` and `QUALITIES`
in `watermark.ts`.

### Allowed file types

| Type | Admin (create product, edit media) | API (`POST /admin/uploads`) |
|---|---|---|
| JPEG, PNG, WebP | accepted | accepted |
| AVIF | not offered | accepted |
| GIF, HEIC, SVG | rejected on Save (see below) | rejected: "GIF images aren't supported. Upload a JPEG, PNG or WebP image." |

GIF would lose its animation, SVG would stop being a vector, and HEIC can't be
read by the image library. The admin's own file picker still offers them
(its list is hard-coded in `@medusajs/dashboard`), so they're refused by the
server on Save.

The admin also refuses any file over **10 MB** as soon as it's added
(`admin.maxUploadFileSize` in `medusa-config.ts`; Medusa's default is 1 MB,
which would block most phone photos before they could be compressed).

### What the admin user sees when an upload is refused

**As soon as a file is added** (no Save needed), under the upload box:

- a file over 10 MB: Medusa's own "too large" message.

**On Save**, when the file is a GIF, HEIC or SVG, or the server can't bring an
image under 500 KB (in practice, only a large PNG photo). The editor only sends files to the server on Save, so
this can't be shown earlier. The server's message names the file and the
reason, for example: `Can't upload "photo.png": it is still 806 KB after
compressing it down to 1200 px, and the limit is 500 KB. PNG files can only be
compressed without loss; save the image as JPEG or WebP instead.`

- **Create product:** the admin shows that message in a toast.
- **Product media editor (Edit media):** Medusa's editor never shows the
  backend's message; it shows its own fixed text under the images. That text is
  replaced in `src/admin/i18n/json/en.json` with the rules: "Upload failed.
  Images must be JPEG, PNG or WebP, and no larger than 500 KB after compression.
  Very detailed photos may need to be made smaller first." The editor then also
  tries to save the product without the failed image's link, which Medusa
  refuses with a second, technical message ("Invalid request: Field 'images, 0,
  url' is required"). Nothing is saved. That second message is Medusa's own
  behaviour and can't be changed from this project.

## How it works

```
Admin: product media editor / create product
        │  POST /admin/uploads (files)
        ▼
Medusa reads the files into memory (multer)
        ▼
watermarkUploads middleware ── adds the logo, compresses to ≤ 500 KB (or rejects),
        │                       renames it watermarked_<name>
        ▼
Medusa's upload route ── uploadFilesWorkflow ── File Module ── local disk now, S3 later
```

- **New uploads.** The admin's product media editor and product create form both
  upload through `POST /admin/uploads`. A middleware on that route watermarks
  and compresses each image after Medusa has read it and before Medusa stores
  it. Files that aren't images, such as CSVs, pass untouched. An image that
  can't be watermarked (GIF, SVG, HEIC) or brought under 500 KB is rejected
  rather than stored.
- **Existing images.** The imported catalogue's images are links to the old
  WooCommerce site (`www.ingredientsbazar.com/wp-content/uploads/...`); the files
  were never copied into Medusa. The script downloads each one, watermarks it,
  uploads the copy, and points the product image at it.
- **No double watermarks.** Watermarked files are named `watermarked_<name>`.
  The script skips them. The middleware doesn't add a second logo to them, but
  still compresses them and applies the 500 KB limit.

## Files

All under `apps/backend/`.

| File | What it does |
|---|---|
| `src/api/utils/watermark.ts` | `watermarkAndCompress` (adds the logo, compresses, applies the limit), `isWatermarked`, `watermarkedFileName`, and the settings: corner, size, opacity, `MAX_IMAGE_KB`, `SIZES`, `QUALITIES`. |
| `src/api/utils/watermark-logo.ts` | The logo as an embedded PNG. It's in code because the backend build only copies compiled files. The comment at the top says how to replace it. |
| `src/api/admin/uploads/middlewares.ts` | The `watermarkUploads` middleware on `POST /admin/uploads`. |
| `src/api/middlewares.ts` | Registers it (two added lines). |
| `src/scripts/watermark-product-images.ts` | The one-off script for existing images. |
| `medusa-config.ts` | Picks the file storage: local disk, or S3 when `S3_BUCKET` is set. |
| `.env.template` | `MEDUSA_BACKEND_URL` and the `S3_*` variables. |
| `.gitignore` | Ignores `/static`, where local storage keeps uploaded files. |
| `src/admin/i18n/json/en.json`, `src/admin/i18n/index.ts` | Replace the media editor's "Failed to upload" text with the upload rules. Medusa merges these over its own admin texts. |
| `medusa-config.ts` (`admin.maxUploadFileSize`) | Lets the admin accept files up to 10 MB before compression. |
| `src/api/admin/site-images/route.ts`, `middlewares.ts` | `POST /admin/site-images`: compresses site images without the logo. See [Site images](#site-images-no-watermark). |

New dependency: `sharp`, the image library (already used by the storefront).

## Site images (no watermark)

The watermark middleware runs on `POST /admin/uploads` and can't tell what an
image is for, so anything uploaded there gets the logo. Images for the site
itself upload through their own route instead:

| | Product images | Site images |
|---|---|---|
| Route | `POST /admin/uploads` (Medusa's, used by the product screens) | `POST /admin/site-images` (ours) |
| Logo | Added, top-left | Never |
| Compression, 500 KB limit, JPEG/PNG/WebP only, turned upright | Yes | Yes, the same code (`watermarkAndCompress` with `addLogo: false`) |
| Stored as | `watermarked_<name>` | `site-<name>` |
| Body | multipart form (`files`) | JSON: `{ "files": [{ "filename", "content": <base64> }] }`, up to 3 images of 10 MB |

A file that isn't an image at all is refused with "it isn't an image". Only
signed-in admins can use the route (Medusa protects `/admin`).

Every admin screen that uploads images for the site (the storefront content
page, blog covers) should use this route rather than its own upload route.

## Watermarking the existing images

From `apps/backend`:

```bash
pnpm medusa exec ./src/scripts/watermark-product-images.ts
```

For each product image that isn't watermarked yet, the script:

1. downloads it;
2. adds the logo and compresses it, exactly like an upload (nothing is changed
   if this fails);
3. uploads the copy through Medusa's File Module;
4. points the image at the copy. The image keeps its id, so variant images stay
   linked and the order stays the same, and its old link is saved in the
   image's `metadata.original_url`. The product's thumbnail follows its image.

It prints progress and a summary. A product that fails is left as it was, and
its uploaded copies are deleted. **It's safe to run again**: watermarked images
are skipped, so a second run only retries what failed. To do only some
products, pass their ids:

```bash
pnpm medusa exec ./src/scripts/watermark-product-images.ts prod_01... prod_02...
```

Run it once in each environment. **With local storage, run it on the server
that stores the files** (the script refuses to run against a non-local
database unless `S3_BUCKET` is set): the copies are written to that machine's `static`
folder, so running it on a laptop against the live database would link live
products to files that only exist on the laptop.

On 23 Oct the local catalogue had 354 images on 333 products, all linked from
the WooCommerce site. Those were watermarked before compression was added; on
24 Oct all 356 product images were watermarked and the largest stored file was
253 KB, so they're within the limit too.

## File storage: local now, S3 later

`medusa-config.ts` configures Medusa's File Module:

- **Local (now).** Files are saved in the backend's `static` folder and served
  at `<MEDUSA_BACKEND_URL>/static/<file>`. **Set `MEDUSA_BACKEND_URL` to the
  backend's public address in every deployed environment.** Medusa's default
  is `http://localhost:9000`, which gives broken image links anywhere but a
  developer's machine. Many hosts also wipe the server's disk on every
  redeploy, which deletes the files; check that the live host keeps the
  `static` folder, or switch to S3.
- **S3 (later).** Set `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`,
  `S3_SECRET_ACCESS_KEY` and `S3_FILE_URL` (the public address of the bucket's
  files). For an S3-compatible service other than AWS, such as Supabase Storage
  or MinIO, also set `S3_ENDPOINT`. `S3_PREFIX` is an optional folder inside the
  bucket. No code changes: the middleware and the script only talk to the File
  Module. This branch has not been tested against a real bucket. Some
  S3-compatible services also need path-style URLs; if so, add
  `additional_client_config: { forcePathStyle: true }` to the S3 options in
  `medusa-config.ts`.
- **On Medusa Cloud**, Medusa sets up S3 storage itself, and this configuration
  steps aside.

Files already stored locally aren't moved when you switch. Their links keep
pointing at the backend's `/static` folder, which works only while the backend
still has them. Copying them to the bucket and updating the links would be a
separate step.

## Checks

Tested on the local database, with `pnpm dev` running.

**Site images**, 29 Oct:

| Check | Result |
|---|---|
| The same photo through `POST /admin/uploads` | `watermarked_quinoa-seeds…`, logo top-left (top-left change 54.4, opposite corner 0.0) |
| …through `POST /admin/site-images` | `site-quinoa-seeds…`, no logo (top-left change 0.9, compression only), 75 KB |
| 4000×3000 JPEG, 4.3 MB, as a site image | 2000×1500, 480 KB, no logo |
| GIF / a text file named `.jpg` / no admin login | 400 "GIF images aren't supported…" / 400 "it isn't an image…" / 401 |

**Uploads with compression** (`POST /admin/uploads`, as the admin sends them),
24 Oct: 19 of 20 checks passed. The one failure was the test's own logo
detector on pure noise, where every pixel changes at quality 60; the stored
image was looked at directly and has the logo top-left.

| Upload | Result |
|---|---|
| 600×600 JPEG, 99 KB | 600×600 (not enlarged), 77 KB, logo top-left |
| Photo stored sideways with a rotation flag (800×400) | stored upright (400×800), logo top-left |
| PNG with a transparent background | still transparent, logo top-left |
| 2000×150 banner | 2000×150, logo sized by the short side |
| 4000×3000 JPEG photo of seeds, 4.3 MB | 2000×1500, 480 KB, logo top-left |
| 3000×2000 PNG graphic, 108 KB | 2000×1333, 91 KB, still PNG |
| 3000×3000 JPEG of pure noise, 8.9 MB | 1600×1600, 474 KB |
| 3000×2250 PNG photo, 5 MB | rejected: still 806 KB at 1200 px, with the "save as JPEG or WebP" advice |
| GIF | rejected: "GIF images aren't supported. Upload a JPEG, PNG or WebP image." |
| A 4.3 MB file already named `watermarked_…` | compressed to 480 KB, no second logo, name unchanged |
| CSV | stored byte for byte as sent |
| A JPEG and a too-large PNG in one upload | rejected; nothing stored |

The media editor's follow-up save after a failed upload was also tried on a
throwaway product: Medusa answered 400, "Invalid request: Field 'images, 0,
url' is required", and saved nothing.

**Script**, on two products (Cinnamon powder 0906 with 4 images, Cashew Kernel
Split with 3): 16 of 16 passed. The image ids and order were unchanged, every
image pointed at a watermarked local file, each `original_url` matched the old
link, the thumbnails followed their images, and a variant linked to an image
kept the link. A second run found nothing to do.

**Code:** `pnpm medusa lint` reports no problems in these files (the 2 warnings
are in the existing inquiry routes), and `pnpm build` completes.

### Manual checks in the admin

- [ ] Products → a product → Media → upload a JPEG: the image shows the logo in
      the top-left, in the admin and on the storefront.
- [ ] Create a product with an image: the same.
- [ ] Upload a large phone photo (up to 10 MB): it's accepted, and the stored
      file (open the image in a new tab, then check the file in
      `apps/backend/static`) is at most 500 KB and at most 2000 px on its
      longest side.
- [ ] Edit media → add a GIF and Save: the editor shows the "Upload failed…"
      rules text and nothing is added.
- [ ] Add a file over 10 MB: Medusa's "too large" message appears straight away.
- [ ] Edit media → add a large PNG photo and Save: the editor shows "Upload
      failed. Images must be JPEG, PNG or WebP, and no larger than 500 KB after
      compression…" and nothing is added.
- [ ] Create a product with a large PNG photo: the toast names the file and the
      reason.
- [ ] After running the script, a product's images show the logo, and the image
      order and thumbnail are unchanged.
- [ ] A photo uploaded through `POST /admin/site-images` has **no** logo; the
      same photo uploaded to a product's media gets the logo.

## Limitations

- **Burned in.** For new uploads only the watermarked file is stored. To change
  the logo or its position later, images need the originals: for the imported
  catalogue, `metadata.original_url` points at them while the WooCommerce site
  is up. New uploads have no stored original, because local storage has no
  truly private files. With S3, originals could be kept in a private bucket.
- **The old site still serves clean images.** While the WooCommerce site is up,
  anyone with an old link can open an image without the logo.
- **Only uploads through `POST /admin/uploads`.** That's every product image
  upload the admin makes today. Anything uploaded there gets the logo, whatever
  it's for, so site images must use `POST /admin/site-images`. An image added
  by URL (for example through a product import or the API) isn't uploaded, so
  it isn't watermarked until the script runs again.
  If a future Medusa admin uploads straight to S3 through presigned URLs, it
  would bypass the middleware; check after upgrading Medusa.
- **Re-uploading a downloaded image** that has lost its `watermarked_` name gets
  a second logo.
- **Compression costs detail.** Very detailed photos may be stored at 1600 or
  1200 px, or at quality 60. Large PNG photos are rejected rather than changed
  to another format.
- **The media editor's two messages.** When the server rejects an upload in
  Edit media, the editor shows the replaced rules text plus Medusa's technical
  "images, 0, url is required" message; see
  [What the admin user sees](#what-the-admin-user-sees-when-an-upload-is-refused).
  The replaced text is in English only, the admin's default language.
- **The 500 KB check happens on Save.** Only file type and the 10 MB cap are
  checked when a file is added; whether an image fits after compression is only
  known once the server has compressed it.
- **The logo file** has speckle noise around its edges from a rough background
  removal. It shows little at this size; a clean PNG or SVG from the client
  would look better. Replacing it only changes `watermark-logo.ts`.
