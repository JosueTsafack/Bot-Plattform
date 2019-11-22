FROM node:slim

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./

RUN npm install --only=production

# Bundle source
COPY . /usr/src/app

ENV NODE_ENV=production

RUN npm run build

# Port to expose
EXPOSE 8080

CMD [ "npm", "run", "server"]
