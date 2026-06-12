# Stage 1: Vite 构建
FROM node:20.19.2-alpine3.21 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx vite build

# Stage 2: Nginx 运行
FROM nginx:1.28.0-alpine3.21
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
