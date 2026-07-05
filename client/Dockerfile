FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
# npm install (not ci) — lockfile optional deps differ across platforms.
RUN npm install --no-audit --no-fund

COPY . .
# No VITE_API_URL → production build uses same-origin (/auth/*) requests.
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build/client /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
