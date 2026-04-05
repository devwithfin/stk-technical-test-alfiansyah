FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install --prefer-offline --retries 5 --fetch-timeout 60000

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]