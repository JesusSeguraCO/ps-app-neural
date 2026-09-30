# Imagen de @ps/worker (ADR-0009/0010): bundle de esbuild; pg_dump 16 y age se añaden con la tarea exportar_banco.
FROM node:22-slim AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/worker/package.json apps/worker/
COPY packages/dominio/package.json packages/dominio/
COPY packages/contratos/package.json packages/contratos/
COPY packages/infra/package.json packages/infra/
RUN npm ci --workspace @ps/worker --include-workspace-root
COPY . .
RUN npm run build -w @ps/worker

FROM node:22-slim AS run
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /repo/apps/worker/dist ./dist
USER node
# `node dist/migrar.js` es el job migrar (ADR-0010 CON-3); `--comprobar` valida la configuración.
CMD ["node", "dist/worker.js"]
