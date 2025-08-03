FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=4000

ENV HOST=0.0.0.0

ENV SUPABASE_JWT_SECRET="5zUyIiUCwuVglYQiXu847i+uIoaphtR4dih5mnVCP+7cHgt8gOdbpslgKwkGhzoS+9+h8sL/iDlLg9WRheSqpQ=="

EXPOSE 4000

CMD [ "npm", "start" ]