## graphiql-deployment [![Build Status](https://travis-ci.org/HSLdevcom/graphiql-deployment.svg?branch=master)](https://travis-ci.org/HSLdevcom/graphiql-deployment)

Deployment for HSL version of [GraphiQL](https://github.com/graphql/graphiql). Production deployment available from https://api.digitransit.fi/graphiql/hsl

## Start server

```sh
REACT_APP_DEV_API_SUBSCRIPTION_KEY=key REACT_APP_API_SUBSCRIPTION_KEY=key REACT_APP_API_SUBSCRIPTION_KEY_PARAM=digitransit-subscription-key yarn start
```

Environment variables `REACT_APP_DEV_API_SUBSCRIPTION_KEY`, `REACT_APP_API_SUBSCRIPTION_KEY`, and `REACT_APP_API_SUBSCRIPTION_KEY_PARAM` are set in the GraphQL request query string for the authorization gateway service.

## Docker

### Build
```sh
docker build \
    --build-arg REACT_APP_DEV_API_SUBSCRIPTION_KEY=key \
    --build-arg REACT_APP_API_SUBSCRIPTION_KEY=key \
    --build-arg REACT_APP_API_SUBSCRIPTION_KEY_PARAM=digitransit-subscription-key \
    -t graphiql .
```

### Run
```sh
docker run -it -p 8099:8080 graphiql
```

## Code formatting
```sh
yarn lint
```
