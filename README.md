## graphiql-deployment

[Build](https://github.com/HSLdevcom/graphiql-deployment/actions)

Deployment for HSL version of [GraphiQL](https://github.com/graphql/graphiql). Production deployment available from https://api.digitransit.fi/graphiql/hsl

## Start server

```sh
VITE_DEV_API_SUBSCRIPTION_KEY=key VITE_API_SUBSCRIPTION_KEY=key VITE_API_SUBSCRIPTION_KEY_PARAM=digitransit-subscription-key yarn start
```

Environment variables `VITE_DEV_API_SUBSCRIPTION_KEY`, `VITE_API_SUBSCRIPTION_KEY`, and `VITE_API_SUBSCRIPTION_KEY_PARAM` are set in the GraphQL request query string for the authorization gateway service.

## Docker

### Build
```sh
docker build \
    --build-arg VITE_DEV_API_SUBSCRIPTION_KEY=key \
    --build-arg VITE_API_SUBSCRIPTION_KEY=key \
    --build-arg VITE_API_SUBSCRIPTION_KEY_PARAM=digitransit-subscription-key \
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
