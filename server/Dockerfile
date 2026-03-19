FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
