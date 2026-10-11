# ---- Build ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite inlines these at build time
ARG VITE_API_URL=/api
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_SUPPORT_EMAIL=
ENV VITE_API_URL=$VITE_API_URL \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_SUPPORT_EMAIL=$VITE_SUPPORT_EMAIL

RUN npm run build

# ---- Serve ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
