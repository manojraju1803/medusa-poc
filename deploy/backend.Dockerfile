# Demo image for the Medusa backend (server + admin). Build from the repo root:
#   docker build -f deploy/backend.Dockerfile -t ib-backend .
FROM node:22-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@10.11.1
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/backend/package.json apps/backend/
COPY apps/storefront/package.json apps/storefront/
RUN pnpm install --frozen-lockfile --filter @dtc/backend...
COPY apps/backend apps/backend
RUN cd apps/backend && pnpm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/apps/backend/.medusa/server ./
RUN npm install --omit=dev --no-audit --no-fund
ENV NODE_ENV=production
EXPOSE 9000
# No migrations or seeding on boot: the shared DB is migrated by hand
CMD ["npx", "medusa", "start"]
