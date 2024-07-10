FROM node:lts-alpine3.20

WORKDIR /dobrynya

COPY dist ./dist
COPY proto ./proto
COPY package.json ./
COPY pm2.json ./
COPY tsconfig.build.json ./
COPY tsconfig.json ./

EXPOSE 3000

RUN npm i pm2 -g
RUN npm install
RUN ls -al -R
CMD [ "pm2-runtime", "start", "pm2.json" ]

