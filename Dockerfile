FROM node:20-alpine AS builder
LABEL maintainer="Digitransit <digitransit@HSL.fi>"

WORKDIR /opt/digitransit-graphql

# Copy files to build container, install dependencies, and build application.
COPY . .
RUN yarn install
RUN yarn build


FROM nginx:1.27.2-alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx files, copy built files, and copy nginx configuration.
RUN rm -rf ./*
COPY --from=builder /opt/digitransit-graphql/build .
COPY --from=builder /opt/digitransit-graphql/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
ENTRYPOINT ["nginx", "-g", "daemon off;"]
