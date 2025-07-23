# ---------- build stage ----------
FROM node:18-alpine AS build
WORKDIR /usr/src/app
COPY api/package*.json ./
RUN npm ci --omit=dev
COPY api .
RUN npm run build || echo "No build script"

# ---------- runtime stage ----------
FROM node:18-alpine
WORKDIR /usr/src/app
COPY --from=build /usr/src/app .
EXPOSE 3000
ENV NODE_ENV=production
USER node
CMD ["node", "server.js"]
