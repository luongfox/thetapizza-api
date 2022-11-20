# Install dependencies
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN apk add --update --no-cache make g++ jpeg-dev cairo-dev giflib-dev pango-dev libtool autoconf automake
COPY package*.json ./

# Start development
FROM base AS development
WORKDIR /app
ENV NODE_ENV=development
EXPOSE 3000
RUN npm install
COPY . .
CMD ["npm", "start"]

# Start production
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production
EXPOSE 3000
RUN npm install --production
COPY . .
CMD ["npm", "start:prod"]
