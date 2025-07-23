FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=4455

ENV HOST=0.0.0.0

EXPOSE 4455

CMD [ "npm", "start" ]