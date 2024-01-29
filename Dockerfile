FROM node:16.14.0

WORKDIR /app

COPY . /app/

RUN npm install

CMD npm start
