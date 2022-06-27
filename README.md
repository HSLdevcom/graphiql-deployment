# graphiql-deployment [![Build Status](https://travis-ci.org/HSLdevcom/graphiql-deployment.svg?branch=master)](https://travis-ci.org/HSLdevcom/graphiql-deployment)

Deployment for HSL version of [GraphiQL](https://github.com/graphql/graphiql). Production deployment available from https://api.digitransit.fi/graphiql/hsl

## Run against local OTP server

In Docker (assume OTP is running at `localhost:9080`):

```sh
docker -t digitransit-graphiql build .
docker run --env REACT_APP_OTP_URL='http://localhost:9080/otp/routers/{{router}}/index/graphql' digitransit-graphiql
```

Locally:

```sh
REACT_APP_OTP_URL=http://localhost:9080/otp/routers/{{router}}/index/graphql yarn start
```
