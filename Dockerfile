FROM node:16-alpine3.16
LABEL maintainer="Digitransit <digitrtransit@hsl.fi>"

WORKDIR /opt/digitransit-graphql

COPY . ./
RUN yarn

EXPOSE 8080
ENTRYPOINT ["yarn", "start"]
