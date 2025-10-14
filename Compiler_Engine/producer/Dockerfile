FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=5005
ENV REDIS_PORT=6377
ENV WS_SERVER_URL='https://www.rtc-app.linkpc.net/notify'

EXPOSE 5005

CMD [ "npm", "start" ]