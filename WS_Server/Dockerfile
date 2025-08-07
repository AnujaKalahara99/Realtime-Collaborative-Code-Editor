FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=4455

ENV HOST=0.0.0.0

ENV SUPABASE_URL='https://kafnsbymonfgbjwzwngz.supabase.co'

ENV SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZm5zYnltb25mZ2Jqd3p3bmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjcxMDUsImV4cCI6MjA2OTEwMzEwNX0.o2HtzKtDP19_JLLAJkKwyRIxzGsB_AD57or4469Onwo'

EXPOSE 4455

CMD [ "npm", "start" ]