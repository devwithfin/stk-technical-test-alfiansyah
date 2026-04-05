FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install --prefer-offline --retries 5 --fetch-timeout 60000

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]