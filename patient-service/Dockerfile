FROM node:18-alpine

WORKDIR /app

COPY package.json .
RUN npm install --only=production

COPY patient-service.js .

EXPOSE 8080
ENV PORT=8080

CMD ["npm", "start"]
