ARG NODE_VERSION=20.9.0

FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV production

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

CMD ["node", "server.js"]
