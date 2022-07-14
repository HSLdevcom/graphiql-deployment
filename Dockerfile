FROM node:16-alpine3.16 as build
LABEL maintainer="Digitransit <digitrtransit@hsl.fi>"

WORKDIR /opt/digitransit-graphql

COPY . ./
RUN yarn && yarn build

FROM node:16-alpine3.16
WORKDIR /app
COPY --from=build /opt/digitransit-graphql/run.sh ./
COPY --from=build /opt/digitransit-graphql/build ./
COPY --from=build /opt/digitransit-graphql/serve.json ./
RUN yarn global add serve@14.x
EXPOSE 8080
ENTRYPOINT ["./run.sh"]
