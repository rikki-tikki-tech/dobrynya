FROM node:lts-alpine3.20

WORKDIR /dobrynya

COPY dist ./dist
COPY proto ./proto
COPY package.json ./
COPY pm2.json ./
COPY tsconfig.build.json ./
COPY tsconfig.json ./

EXPOSE 4000

RUN npm i pm2 -g && npm install

CMD [ "pm2-runtime", "start", "pm2.json" ]
