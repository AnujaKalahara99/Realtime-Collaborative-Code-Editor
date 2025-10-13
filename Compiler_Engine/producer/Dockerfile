FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=5005

ENV WS_SERVER_URL='http://10.0.2.2:4455'

EXPOSE 5005

CMD [ "npm", "start" ]