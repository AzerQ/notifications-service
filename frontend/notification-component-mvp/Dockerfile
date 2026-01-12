# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copy a custom nginx config if needed, but default is usually fine for simple SPAs
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
