# Private documents and file storage (S3)

Suppliers' quality documents (Specification Sheet, COA, MSDS, Non-GMO, Melamine
Free, ISO 22000/HACCP, Kosher, Halal) used to be stored as "private" files that
were still served publicly from the backend's `/static` folder: anyone with the
link could open them. They now live in a locked S3 bucket and are opened only
through routes that check who's asking.

**Who can open a customer's document**

| Caller | Result |
|---|---|
| The customer it belongs to | Redirect to a link that works for 5 minutes |
| An admin user | Redirect to a link that works for 5 minutes |
| Logged out | **401** |
| Another customer | **401** |

All uploaded files, product images included, are stored in S3. There is no
local-disk storage any more: the backend refuses to start without the S3
settings, so a private file can never fall back to the public `static` folder.

## How it works

```
                      ┌─ public uploads (product and site images) ──► media bucket (anyone can read)
Medusa File Module ── s3-file provider
                      └─ private uploads ──────────────────────────► documents bucket (locked)
                            documents/<customer_id>/coa-form-01J8….pdf     uploaded or replaced from the profile
                            documents/signup/<auth_identity_id>/…           uploaded at signup (they stay here)
                            private/…                                       product exports and imports
```

- **Storage provider** (`src/modules/s3-file`). Medusa's File Module accepts
  exactly one provider, and Medusa's own S3 provider uses one bucket, so this
  project has its own. It sends public uploads to the media bucket and private
  uploads (Medusa's default) to the documents bucket. A key that starts with
  `documents/` or `private/` is in the documents bucket; anything else is media.
  It adds a ULID to every file name, e.g. `coa-form-01J8ZQ3K9TWN5X4VD2C7R6M1BA.pdf`.
- **Folder = owner.** The server always builds a document's path from the
  signed-in identity, so its folder says whose it is. A download is allowed
  only if the stored key is in that customer's folder, or in the signup folder
  of the login (auth identity) Medusa records as theirs
  (`app_metadata.customer_id`). A tampered metadata entry can't point at
  someone else's file (`src/api/utils/document-owner.ts`). The customer's
  original file name is kept in `metadata.documents[].filename`.
- **Signup.** Suppliers upload documents before their account exists (it's
  created after e-mail verification), so there's no customer id yet. They go
  to `documents/signup/<auth_identity_id>/` and **stay there**: once the
  account exists, the login belongs to the customer, so the download check
  accepts that folder. Nothing has to run after signup, so nothing can fail
  and leave documents unreachable. The account-creation request may only list
  files from the caller's own signup folder; anything else is dropped.
  Documents uploaded or replaced later go to `documents/<customer_id>/`, so a
  supplier's files can be in both folders; the profile and the admin list them
  from the metadata either way.
- **Downloads.** The routes find the document by type (`coa-form`), check the
  folder, and redirect to a presigned S3 link valid for 5 minutes. The browser
  then downloads it straight from S3, named after the document type
  (`coa-form.pdf`). The plain S3 address of a document is refused.
- **Deleting a customer** deletes their documents from the bucket, in both
  folders. Medusa only marks the customer as deleted, so the subscriber can
  still read which files were theirs. Deleting a customer from the admin also
  deletes their login, so a signup folder counts unless its login now belongs
  to another customer.
- **Storefront.** The customer's login token is in a storefront cookie
  (`_medusa_jwt`), so a plain link to the backend can't prove who's asking. The
  profile's View button opens `/api/documents/<type>` on the storefront, which
  adds the token and passes the backend's redirect on.

`customer.metadata.documents` entries are now `{ label, filename, key, uploaded_at }`.
Before, they held a public `url` (and sometimes `file_id`) instead of `key`.
Those older entries are still listed on the profile and the admin page, with
no View button ("Being moved to secure storage" / "Being secured"), until the
move script has secured them (see [Deploying](#deploying)).

## Buckets

| | Media (public) | Documents (private) |
|---|---|---|
| Development | `ingredientsbazar-media-dev` | `ingredientsbazar-documents-dev` |
| Live | `ingredientsbazar-media` (not created yet) | `ingredientsbazar-documents` (not created yet) |

All in `ap-south-1` (Mumbai), encrypted (SSE-S3), tagged
`project=ingredientsbazar`. The development pair was created on 28 Oct.

- **Media:** a bucket policy lets anyone read objects (`s3:GetObject`). Block
  Public Access stays on for ACLs; only the policy switches are off.
- **Documents:** all four Block Public Access switches on, no bucket policy.
  Lifecycle: abort incomplete uploads after 7 days. There's deliberately no
  rule that deletes signup files: a bucket rule only sees folder names and
  ages, so it can't tell a finished signup from an abandoned one. CORS: `PUT`
  from the admin's address, for product import, which uploads its CSV straight
  to S3 (CORS only permits the request; the presigned link is still required).

To create the live pair, run the same commands as for development with the live
names, and the live admin's address in the CORS rule:

```bash
B=ingredientsbazar-documents
aws s3api create-bucket --bucket $B --region ap-south-1 --create-bucket-configuration LocationConstraint=ap-south-1
aws s3api put-public-access-block --bucket $B --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws s3api put-bucket-encryption --bucket $B --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"},"BucketKeyEnabled":true}]}'
aws s3api put-bucket-lifecycle-configuration --bucket $B --lifecycle-configuration '{"Rules":[{"ID":"abort-incomplete-uploads","Filter":{"Prefix":""},"Status":"Enabled","AbortIncompleteMultipartUpload":{"DaysAfterInitiation":7}}]}'
aws s3api put-bucket-cors --bucket $B --cors-configuration '{"CORSRules":[{"ID":"admin-product-import","AllowedOrigins":["https://<live admin address>"],"AllowedMethods":["PUT"],"AllowedHeaders":["*"],"MaxAgeSeconds":3000}]}'

M=ingredientsbazar-media
aws s3api create-bucket --bucket $M --region ap-south-1 --create-bucket-configuration LocationConstraint=ap-south-1
aws s3api put-public-access-block --bucket $M --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false
aws s3api put-bucket-encryption --bucket $M --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"},"BucketKeyEnabled":true}]}'
aws s3api put-bucket-policy --bucket $M --policy '{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadImages","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::ingredientsbazar-media/*"}]}'
```

## Settings

In `apps/backend/.env` (development values are in `.env.template`):

| Setting | Development value |
|---|---|
| `S3_REGION` | `ap-south-1` |
| `S3_MEDIA_BUCKET` | `ingredientsbazar-media-dev` |
| `S3_MEDIA_URL` | `https://ingredientsbazar-media-dev.s3.ap-south-1.amazonaws.com` |
| `S3_DOCUMENTS_BUCKET` | `ingredientsbazar-documents-dev` |
| `S3_ENDPOINT` | not set (only for S3-compatible services other than AWS) |

If one is missing, the backend stops at startup with "S3 file storage isn't
configured: set …".

## Credentials

No AWS keys are stored in the project. The provider uses AWS's standard lookup:

- **On a developer's machine:** `aws login`. Sessions last up to 12 hours; when
  one expires, uploads and downloads fail until you sign in again. Each
  developer needs access to the development buckets (PowerUserAccess is
  enough).
- **Backend in Docker** (`pnpm docker:up`): the `medusa` container can't see
  your `aws login` session; `docker-compose.yml` only passes it
  `apps/backend/.env`. Put `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` (and
  `AWS_SESSION_TOKEN` for temporary keys) in `apps/backend/.env`, or run the
  backend outside Docker as the README recommends. After `aws login`,
  `aws configure export-credentials --format env-no-export` prints temporary
  ones in `.env` form; they expire with the session.
- **On the live server:** an IAM role, or `AWS_ACCESS_KEY_ID` and
  `AWS_SECRET_ACCESS_KEY` in the server's environment, for a user or role with
  only this policy. PowerUserAccess can't create IAM users or roles, so the AWS
  account's administrator has to set this up:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "IngredientsBazarFiles",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:AbortMultipartUpload"],
      "Resource": [
        "arn:aws:s3:::ingredientsbazar-media/*",
        "arn:aws:s3:::ingredientsbazar-documents/*"
      ]
    }
  ]
}
```

## Files

All under `apps/backend/` unless noted.

| File | What it does |
|---|---|
| `src/modules/s3-file/service.ts`, `index.ts` | The two-bucket storage provider: upload, upload stream (exports), presigned upload (imports), presigned download, read, delete. Refuses to start without its settings. |
| `medusa-config.ts` | Uses that provider; the local-disk fallback and the Medusa Cloud exception are gone. |
| `src/api/utils/document-files.ts` | Folder rules, `documentType` ("COA Form" -> `coa-form`), the metadata entry type, and the list the profile and admin show (older entries included). Pure; the admin uses it too. |
| `src/api/utils/document-owner.ts` | Which keys are really a customer's: their folder, or their own login's signup folder. |
| `src/api/utils/document-download.ts` | Finds a customer's document by type, checks it's theirs, returns the 5-minute link. |
| `src/api/store/registration-documents/route.ts` | Signup upload: stores under the caller's signup folder, returns keys. |
| `src/workflows/update-customer-documents.ts` | Profile and admin uploads: stores under `documents/<customer_id>/`, saves keys. Sends only `documents`, so other metadata changed meanwhile is kept. |
| `src/api/store/customers/me/protect-metadata.ts` | Also guards account creation: keeps only documents from the caller's own signup folder. |
| `src/subscribers/customer-documents.ts` | On `customer.deleted`, deletes the customer's documents from both folders. |
| `src/api/store/customers/[id]/documents/[type]/route.ts`, `middlewares.ts` | Customer download route. |
| `src/api/admin/customers/[id]/documents/[type]/route.ts` | Admin download route. |
| `src/admin/lib/customer-profile.ts`, `src/admin/routes/customer-profiles/[id]/page.tsx` | The profile page's View button uses the admin route; older entries show "Being secured". |
| `src/scripts/move-files-to-s3.ts` | Moves files stored before S3 (below). |
| `src/scripts/utils/assert-storage-matches-database.ts` | Stops both scripts from linking a shared database's files to the `-dev` buckets. |
| `src/scripts/watermark-product-images.ts` | Uses that check. |
| `apps/storefront/src/app/api/documents/[type]/route.ts` | Storefront route behind the profile's View button. |
| `apps/storefront/src/lib/data/customer.ts`, `src/lib/util/registration.ts`, `src/modules/account/components/profile-details/documents-card.tsx` | Signup keeps keys; documents are listed (older ones without View) and opened through the route; the supplier inquiry keeps names only. |
| `.env.template`, `README.md` | The S3 settings, `aws login` before starting, credentials in Docker. |

New dependencies: `@aws-sdk/client-s3`, `@aws-sdk/lib-storage`,
`@aws-sdk/s3-request-presigner` and `ulid`, at the versions Medusa's own S3
provider already installed.

## API routes

| Route | Who | Answer |
|---|---|---|
| `GET /store/customers/:id/documents/:type` | The customer `:id` (or `me`) | 302 to a 5-minute link; 401 for anyone else; 404 if there's no such document |
| `GET /admin/customers/:id/documents/:type` | Admin users | 302 to a 5-minute link; 404 if there's no such document |
| `GET /api/documents/:type` (storefront) | The signed-in customer | Passes on the backend's redirect; 401 when signed out; 404 if there's no such document; 502 "Couldn't open the document. Please try again." for any other failure |

`:type` is the document's label in lower case with dashes: `specification-sheet`,
`coa-form`, `msds-form`, `non-gmo`, `melamine-free-certificate`,
`iso-22000-haccp-form`, `kosher-certificate`, `halal-certificate`.

## Moving existing files

`src/scripts/move-files-to-s3.ts` moves what was stored before S3. Run it from
`apps/backend`, **on the machine that has the files**, with that environment's
S3 settings. It refuses to run when the `-dev` buckets are set and the database
isn't local (this machine or Docker's `postgres`), and so does
`watermark-product-images.ts`.

```bash
pnpm medusa exec ./src/scripts/move-files-to-s3.ts                  # everything
pnpm medusa exec ./src/scripts/move-files-to-s3.ts prod_01… prod_02… # some products' images only
pnpm medusa exec ./src/scripts/move-files-to-s3.ts documents        # documents and inquiries only
```

- **Product images** linked at `<backend>/static/...` are copied to the media
  bucket and the product images point at the copies (same ids and order;
  thumbnails follow). The local files stay.
- **Documents** saved with a public `url` are copied into
  `documents/<customer_id>/`, their entries get a `key`, and the local file is
  **deleted**, because `static` is public. Only files inside `static` are read.
- **Documents from the old optional S3 setup** (`S3_BUCKET` on `main`) aren't on
  disk. Set `S3_BUCKET` to that bucket (and `S3_ACCESS_KEY_ID` /
  `S3_SECRET_ACCESS_KEY` if its keys differ) and they're read from it by their
  `file_id`. The originals are left there; the script says how many to delete.
- **A file listed by more than one customer** isn't moved for any of them, and
  the script names it: entries weren't checked before this release, so one may
  have been copied from someone else's.
- **Supplier inquiries** keep only the documents' names.

Images still linked from the old WooCommerce site aren't touched; run
`watermark-product-images.ts` for those. Safe to run again: anything already
in S3 is skipped.

On 28 Oct the local database had 357 product images in `static` and no stored
documents. The images of two products (7 images) were moved as a test; the
rest are waiting for a full run.

## Deploying

In this order, on the live server:

1. Create the live buckets (commands above) and have the AWS administrator
   create the credentials (see [Credentials](#credentials)).
2. Set `S3_REGION`, `S3_MEDIA_BUCKET`, `S3_MEDIA_URL` and
   `S3_DOCUMENTS_BUCKET` (and the credentials) in the server's environment.
   Without them the new backend won't start.
3. Deploy.
4. **Straight away**, run `pnpm medusa exec ./src/scripts/move-files-to-s3.ts`
   there. Until it has run, older documents are listed without a View button
   and product images are still served from `static`. Re-run it for any
   customer or product it reports as failed.

## Checks

### After the review (29 Oct)

Tested on the local database and the development buckets, through the real
routes.

**Signup, downloads, deletion:** 28 of 28 passed.

| Check | Result |
|---|---|
| Signup upload | Stored in `documents/signup/<auth_identity_id>/` |
| Account created | Keeps exactly those keys; nothing moves them later; forged entries (another signup's folder, another customer's folder) dropped |
| Owner, straight after creating the account | 302; the link downloads the same bytes |
| Owner via `me`, admin | 302; the link downloads |
| Logged out / another customer / missing document / plain S3 address | 401 / 401 / 404 / 403 |
| An entry edited (by an admin) to point at another supplier's signup file | 404 for that customer and in the admin |
| Storefront route: signed in / signed out / invalid login / missing document / backend down | 307 / 401 / 401 / 404 / 502 "Couldn't open the document. Please try again." |
| Replace / remove a signup document | New file in `documents/<customer_id>/` and the signup file deleted / entry gone and file deleted |
| An older document (public `url`, no key) | Listed in the save response without key or link; can't be opened (404); the storefront profile shows "Being moved to secure storage" |
| Deleting a supplier with 2 signup files and 1 profile file | All 3 deleted |
| Deleting a customer whose entry was edited to point at another supplier's signup file | The other supplier's file stays; deleted with its owner |

**Metadata changed during a document save:** with the old code, an admin
edit made while a file uploaded was overwritten in 2 of 3 runs; with the fix
it was kept in 11 of 13 runs. The 2 losses were edits that landed in the same
few milliseconds as the save's own write. Medusa's metadata update reads and
writes the whole value without a lock, so that short gap applies to every
metadata update in Medusa, not only this one.

**Move script** (made-up older documents): 11 of 11 passed.
- A `/static` document: moved into the customer's folder with its name and
  date; other metadata kept; the local copy deleted; the admin can open it.
- A document in an "old bucket" (`S3_BUCKET`): copied with the same content;
  the original left there, and the script said so.
- One file listed by two customers: moved for neither, and named in the log.
- A link that climbs out of `static/` to `.env`: refused, `.env` untouched,
  nothing uploaded. A link to another site: refused, not fetched.

**Guard:** both scripts refuse to run with the `-dev` buckets on the local
database reached by the machine's network name, as if it were shared;
`localhost`, `127.0.0.1` and Docker's `postgres` count as local, Supabase
addresses as shared.

**Code:** backend `tsc` and `pnpm build` pass; `pnpm medusa lint` shows the
same 5 existing warnings. Storefront `tsc` passes; the changed files lint
clean.

### First round (28 Oct)

Tested on the local database and the development buckets on 28 Oct. Signup
documents were still moved into the customer's folder then; that move has
since been removed.

**End to end, through the real routes:** 24 of 24 passed.

| Check | Result |
|---|---|
| Signup upload | Stored in `documents/pending/<auth_identity_id>/` |
| Account created | Moved to `documents/<customer_id>/coa-form-<ULID>.pdf` and `halal-certificate-<ULID>.png`; pending originals deleted |
| Forged entries at account creation (another signup's folder, another customer's folder) | Dropped |
| Profile upload, admin upload | Stored in `documents/<customer_id>/` |
| Owner (by id and by `me`) | 302; the link downloads the same bytes, named `coa-form.pdf`; link lifetime 300 s |
| Admin | 302; the link downloads |
| Logged out | 401 |
| Another customer | 401 |
| A document the customer doesn't have | 404 |
| The document's plain S3 address | 403 |
| Storefront `/api/documents/coa-form` | 307 to a presigned link; 401 signed out |
| Replace / remove | New file in the folder, old file deleted / entry gone, file deleted |
| Image upload in the admin | Watermarked, in the media bucket, publicly readable |
| Product import | Presigned upload lands in `private/`; the admin's address may upload (CORS) |
| Product export | CSV written to `private/` |

**Deleting customers:** 6 of 6 passed. Supplier C (3 documents) deleted: all
3 files gone, the backend logged "Deleted 3 document(s) of deleted customer
…". Supplier E's document untouched until E was deleted, then gone. A customer
with no documents deleted without errors.

**Startup without S3 settings:** refused with "S3 file storage isn't configured:
set S3_MEDIA_BUCKET, S3_DOCUMENTS_BUCKET in apps/backend/.env…".

**Move script:**
- Images of 2 products moved: same image ids and order, thumbnails followed, the
  public copy is byte-identical; a second run moved nothing.
- A made-up old-style document (public `/static` link, served with 200 before)
  was moved into the customer's folder, keeping its label, file name and date;
  the old link then returned 404; the admin could download it; its inquiry kept
  only names; a second run moved nothing.

**Code:** backend `tsc` and `pnpm build` pass; `pnpm medusa lint` shows no new
warnings (5 existing ones). Storefront `tsc` passes; its lint reports errors
only in files this work didn't change.

### Manual checks

- [ ] Sign up as a supplier with two documents, verify the e-mail and log in:
      Account → Profile shows them, and View opens each.
- [ ] Admin → the customer → View & edit full profile → Quality documents: View
      opens each; Replace and Upload work.
- [ ] Copy a View link from the profile, open it in a private window: the
      storefront asks you to sign in (401).
- [ ] Wait 5 minutes on an opened document's S3 link and reload: it has
      expired.
- [ ] Upload a product image: it's on `ingredientsbazar-media-dev…amazonaws.com`.
- [ ] Products → Import and Products → Export still work.
- [ ] Delete a test supplier in the admin: their `documents/<customer_id>/`
      and `documents/signup/<auth_identity_id>/` files disappear from the
      bucket.

## Notes and limitations

- **Every developer needs AWS access**, and `aws login` again after up to 12
  hours. Without credentials the backend starts, but uploads and downloads
  fail.
- **401 for another customer**, as the task asked. 403 or 404 would be more
  usual; 404 would also hide whether the document exists.
- **Deleted means deleted.** Medusa can technically restore a soft-deleted
  customer (there's no button for it in the admin), but their documents would
  already be gone from the bucket.
- **Downloads are named after the document type** (`coa-form.pdf`), not the
  supplier's original file name, which the profile still shows.
- **The link lifetimes** are in `src/modules/s3-file/service.ts`: 5 minutes for
  documents, 1 hour for exports (opened from an admin notification) and for
  import uploads.
- **Abandoned signups aren't cleaned up yet.** Files uploaded by someone who
  never created their account stay in `documents/signup/`, locked. A
  scheduled job that deletes signup folders older than 30 days whose login
  never became a customer is planned as a follow-up. Unlike a bucket rule, it
  checks the database first, so it can't delete a real customer's files.
- **Not for Medusa Cloud.** The project doesn't deploy there, and this setup
  replaces Cloud's own file storage; the README's Cloud section is removed.
- **The storefront has its own copy** of the "COA Form" -> `coa-form` rule
  (`registration.ts`); it must match `documentType` in the backend.
- **Live isn't set up yet:** see [Deploying](#deploying).
