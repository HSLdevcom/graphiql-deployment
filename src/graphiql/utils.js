/* eslint-disable import/prefer-default-export */
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
    return `/graphiql/${router}`;
  }

  return apiVersion === API_VERSION_2
    ? `/graphiql/${router}/${apiVersion}/${dialect}/${dialectVersion}`
    : `/graphiql/${router}/${apiVersion}`;
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
