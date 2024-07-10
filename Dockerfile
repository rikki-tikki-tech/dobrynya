FROM node:lts-alpine3.20

WORKDIR /dobrynya

COPY dist ./dist
COPY package.json ./
COPY pm2.json ./

EXPOSE 3000

RUN npm i pm2 -g
RUN npm i nest
CMD npm run pm2