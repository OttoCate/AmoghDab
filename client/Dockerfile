ARG NODE_VERSION=20.9.0

FROM node:${NODE_VERSION}-alpine

WORKDIR /app

COPY package*.json ./
COPY package-lock.json ./

ENV NODE_ENV=development
RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "start"]
