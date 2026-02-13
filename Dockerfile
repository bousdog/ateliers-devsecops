# Stage 1: Build Angular App
FROM node:20 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build -- --configuration production

# Stage 2: Serve app with Nginx
FROM nginx:alpine
COPY --from=build-stage /app/dist/demo/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]