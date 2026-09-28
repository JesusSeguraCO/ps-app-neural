# Imagen de @ps/portal (ADR-0010): multi-stage, salida standalone de Next, usuario sin privilegios.
FROM node:22-slim AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/portal/package.json apps/portal/
COPY packages/ui/package.json packages/ui/
COPY packages/motor/package.json packages/motor/
COPY packages/contratos/package.json packages/contratos/
COPY packages/dominio/package.json packages/dominio/
COPY packages/infra/package.json packages/infra/
RUN npm ci --workspace @ps/portal --include-workspace-root

FROM deps AS build
COPY . .
RUN npm run build -w @ps/portal

FROM node:22-slim AS run
ENV NODE_ENV=production PORT=8080 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /repo/apps/portal/.next/standalone ./
COPY --from=build /repo/apps/portal/.next/static ./apps/portal/.next/static
USER node
EXPOSE 8080
CMD ["node", "apps/portal/server.js"]
