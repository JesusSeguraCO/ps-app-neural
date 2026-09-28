# Imagen de @ps/panel (ADR-0010): multi-stage, salida standalone de Next, usuario sin privilegios.
FROM node:22-slim AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/panel/package.json apps/panel/
COPY packages/ui/package.json packages/ui/
COPY packages/motor/package.json packages/motor/
COPY packages/contratos/package.json packages/contratos/
COPY packages/dominio/package.json packages/dominio/
COPY packages/infra/package.json packages/infra/
RUN npm ci --workspace @ps/panel --include-workspace-root

FROM deps AS build
COPY . .
RUN npm run build -w @ps/panel

FROM node:22-slim AS run
ENV NODE_ENV=production PORT=8080 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /repo/apps/panel/.next/standalone ./
COPY --from=build /repo/apps/panel/.next/static ./apps/panel/.next/static
USER node
EXPOSE 8080
CMD ["node", "apps/panel/server.js"]
