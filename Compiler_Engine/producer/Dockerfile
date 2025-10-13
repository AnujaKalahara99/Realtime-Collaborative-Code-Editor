FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=4455

EXPOSE 4455

CMD [ "npm", "start" ]