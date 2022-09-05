## graphiql-deployment [![Build Status](https://travis-ci.org/HSLdevcom/graphiql-deployment.svg?branch=master)](https://travis-ci.org/HSLdevcom/graphiql-deployment)

Deployment for HSL version of [GraphiQL](https://github.com/graphql/graphiql). Production deployment available from https://api.digitransit.fi/graphiql/hsl

## Start server

```sh
REACT_APP_API_SUBSCRIPTION_KEY=key REACT_APP_API_SUBSCRIPTION_KEY_PARAM=digitransit-subscription-key yarn start
```

Environment variable `REACT_APP_API_SUBSCRIPTION_KEY` and `REACT_APP_API_SUBSCRIPTION_KEY_PARAM` are set for _Azure API Management_ authorization.

## Run in docker

```sh
docker build -t graphiql
docker run -it \
    -p 8099:8080 \
    -e REACT_APP_API_SUBSCRIPTION_KEY=test \
    -e REACT_APP_API_SUBSCRIPTION_KEY_PARAM=digitransit-subscription-key \
     digitransit-graphiql
```

## Code formatting

Format source codebase:

```sh
yarn format
```
