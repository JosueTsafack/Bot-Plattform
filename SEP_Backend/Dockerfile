FROM node:slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json ./

RUN npm install --only=production

#To build docker container in the docker 
RUN apt-get -yqq update && apt-get -yqq install docker

# Bundle app source
COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]
