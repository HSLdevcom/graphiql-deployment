## graphiql-deployment [![Build Status](https://travis-ci.org/HSLdevcom/graphiql-deployment.svg?branch=master)](https://travis-ci.org/HSLdevcom/graphiql-deployment)

Deployment for HSL version of [GraphiQL](https://github.com/graphql/graphiql). Production deployment available from https://api.digitransit.fi/graphiql/hsl

## Start server

```sh
REACT_APP_API_SUBSCRIPTION_KEY=key yarn start
```

Environment variable `REACT_APP_API_SUBSCRIPTION_KEY` is set for *Azure API Management* authorization.


## Code formatting

Format source codebase:

```sh
yarn format
```
