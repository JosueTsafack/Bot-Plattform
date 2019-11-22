FROM node:slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json ./

RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 3001

CMD [ "npm", "start"]
