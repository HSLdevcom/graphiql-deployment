FROM node:20-alpine AS builder
LABEL maintainer="Digitransit <digitransit@HSL.fi>"

WORKDIR /opt/digitransit-graphql

# Copy files to build container, install dependencies, and build application.
COPY . .

# None of these are secrets, the env parameter can be visible in public.
# These are for more configurability (as opposed to having keys directly in code).
ARG VITE_DEV_API_SUBSCRIPTION_KEY=""
ARG VITE_API_SUBSCRIPTION_KEY=""
ARG VITE_API_SUBSCRIPTION_KEY_PARAM=""
ENV VITE_API_SUBSCRIPTION_KEY_PARAM=$VITE_API_SUBSCRIPTION_KEY_PARAM
ENV VITE_DEV_API_SUBSCRIPTION_KEY=$VITE_DEV_API_SUBSCRIPTION_KEY
ENV VITE_API_SUBSCRIPTION_KEY=$VITE_API_SUBSCRIPTION_KEY

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
