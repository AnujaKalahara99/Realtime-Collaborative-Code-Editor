FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=5000
ENV HOST=0.0.0.0
ENV SUPABASE_URL='https://kafnsbymonfgbjwzwngz.supabase.co'
ENV SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZm5zYnltb25mZ2Jqd3p3bmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjcxMDUsImV4cCI6MjA2OTEwMzEwNX0.o2HtzKtDP19_JLLAJkKwyRIxzGsB_AD57or4469Onwo'
ENV SUPABASE_PROJECT_ID='kafnsbymonfgbjwzwngz'
ENV Email_password='jrla yccu aoyo mnvu'
ENV Email_user='codespace.mora@gmail.com'
ENV GOOGLE_GENERATIVE_AI_API_KEY='AIzaSyB6mgusMu6rVXooU-j99zTSLv_9AYjR6Kc'
ENV NVIDIA_API_KEY='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'
ENV NVIDIA_STARCODER_URL='https://integrate.api.nvidia.com/v1'
ENV NVIDIA_STARCODER_MODEL="bigcode/starcoder2-7b"

ENV NODE_ENV="production"

EXPOSE 5000

CMD [ "npm", "start" ]