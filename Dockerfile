FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app



COPY  package*.json  ./

RUN npm install


COPY . .

EXPOSE ${APP_PORT}

CMD [ "npm", "run", "start:prod" ]