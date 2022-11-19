# Install dependencies
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN apk add --update --no-cache make g++ jpeg-dev cairo-dev giflib-dev pango-dev libtool autoconf automake
COPY package.json package-*.json ./

# Start development
FROM base AS development
EXPOSE 3000
RUN NODE_ENV=development npm install
COPY . .
CMD ["nodemon", "server.js"]

# Start production
FROM base AS production
EXPOSE 3000
RUN NODE_ENV=production npm install
COPY . .
CMD ["node", "server.js"]
