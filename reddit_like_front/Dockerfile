# Build SPA and serve with nginx (Lab 6)
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Same-origin API via reverse proxy: browser calls /api/... on nginx
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ARG VITE_PUBLIC_SITE_URL=http://localhost:8080
ENV VITE_PUBLIC_SITE_URL=$VITE_PUBLIC_SITE_URL

RUN npm run build

FROM nginx:1.27-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY docker/nginx.default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
