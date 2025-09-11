FROM node:lts-alpine

RUN apk add --no-cache git zip unzip

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["node", "index.js"]