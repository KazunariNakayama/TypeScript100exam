FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

# 問題ファイルをコピー
COPY problems ./problems

# ソースコードをコピー
COPY src ./src
COPY tsconfig.json ./

EXPOSE 4000

CMD ["npm", "run", "dev"] 