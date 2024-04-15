FROM node:16.4.0

WORKDIR /app

COPY . /app/

RUN npm install

CMD npm start:docker
