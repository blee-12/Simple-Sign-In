ARG NODE_VERSION=24.12.0-alpine
FROM node:${NODE_VERSION} AS base

WORKDIR /app
COPY ./server ./server
COPY ./common ./common

WORKDIR /app/server
RUN npm install

CMD npm start
EXPOSE 4000
