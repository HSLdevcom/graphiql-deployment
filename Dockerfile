FROM node:16-alpine3.16
LABEL maintainer="Digitransit <digitransit@HSL.fi>"

WORKDIR /opt/digitransit-graphql

COPY . ./
RUN yarn

EXPOSE 8080
ENV REACT_APP_DISABLE_LIVE_RELOAD=true
ENTRYPOINT ["yarn", "start"]
