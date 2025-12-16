ARG NODE_VERSION=24.12.0-alpine
FROM node:${NODE_VERSION} AS base

WORKDIR /app
COPY ./client ./client
COPY ./common ./common

WORKDIR /app/client
RUN npm install

CMD npm start
EXPOSE 5173
