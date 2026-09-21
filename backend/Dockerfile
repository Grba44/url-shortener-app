FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY prisma ./prisma
COPY prisma7.config.ts ./
RUN npx prisma generate
COPY . .
EXPOSE 3000
CMD ["npx", "nodemon", "--legacy-watch", "src/index.js"]