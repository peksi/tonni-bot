FROM node:18-alpine
ENV NODE_ENV=production
ENV DOCKER=true
WORKDIR /usr/src/app




# copy package.json and yarn.lock to the container
COPY package.json yarn.lock ./
# install dependencies
RUN yarn install --production --frozen-lockfile

COPY . .
RUN chown -R node /usr/src/app
USER node
# build prod


RUN yarn build 
CMD ["yarn", "start"]
