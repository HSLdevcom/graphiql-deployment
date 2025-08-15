/* eslint-disable import/prefer-default-export */
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { API_VERSION_2 } from '../config';

export function getApiConfig(
  configList,
  router,
  apiVersion,
  dialect,
  dialectVersion,
) {
  return apiVersion === API_VERSION_2
    ? configList.find(
        config =>
          config.router === router &&
          config.apiVersion === apiVersion &&
          config.dialect === dialect &&
          config.dialectVersion === dialectVersion,
      )
    : configList.find(
        config => config.router === router && config.apiVersion === apiVersion,
      );
}

export function hasRoute(
  configList,
  router,
  apiVersion,
  dialect,
  dialectVersion,
  apiType,
) {
  return Boolean(
    apiVersion === API_VERSION_2
      ? configList.find(
          config =>
            config.router === router &&
            config.apiVersion === apiVersion &&
            config.dialect === dialect &&
            config.dialectVersion === dialectVersion &&
            config.routerUrl[apiType],
        )
      : configList.find(
          config =>
            config.router === router &&
            config.apiVersion === apiVersion &&
            config.routerUrl[apiType],
        ),
  );
}

export function getPath(
  isDefault,
  router,
  apiVersion,
  dialect,
  dialectVersion,
) {
  if (isDefault) {
    return `/${router}`;
  }

  return apiVersion === API_VERSION_2
    ? `/${router}/${apiVersion}/${dialect}/${dialectVersion}`
    : `/${router}/${apiVersion}`;
}

export function getQueryString(query, variables, operationName) {
  const urlSearchParams = new URLSearchParams();
  if (query) {
    urlSearchParams.set('query', encodeURIComponent(query));
  }
  if (variables) {
    urlSearchParams.set('variables', encodeURIComponent(variables));
  }
  if (operationName) {
    urlSearchParams.set('operationName', encodeURIComponent(operationName));
  }
  return `?${urlSearchParams.toString()}`;
}

export function getQueryParameterValues(location) {
  const params = new URLSearchParams(location.search);
  const QUERY_STRING_PARAMS = ['query', 'variables', 'operationName'];
  const result = location.search
    ? QUERY_STRING_PARAMS.reduce(
        (output, paramName) => ({
          ...output,
          [paramName]:
            params.has(paramName) && decodeURIComponent(params.get(paramName)),
        }),
        {},
      )
    : {};
  return result;
}

export function addSubscriptionKey(apiUrl, key, keyParam) {
  const url = new URL(apiUrl);
  if (key && keyParam) {
    url.searchParams.set(keyParam, key);
  }
  return url;
}

export function createGraphiQLFetcherWithSubscriptionKey(
  apiUrl,
  subscriptionKey,
  subscriptionKeyParam,
) {
  return createGraphiQLFetcher({
    url: addSubscriptionKey(apiUrl, subscriptionKey, subscriptionKeyParam),
  });
}
