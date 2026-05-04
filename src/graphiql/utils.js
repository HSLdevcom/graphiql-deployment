/* eslint-disable import/prefer-default-export */
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { API_VERSION_2, API_CONFIG } from '../config';

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

function isEmptyValue(value) {
  return !value || value.trim() === '{}' || value.trim() === '[]';
}

export function getQueryString(query, variables, headers, apiType) {
  const urlSearchParams = new URLSearchParams();
  if (query) {
    urlSearchParams.set('query', query);
  }
  if (!isEmptyValue(variables)) {
    urlSearchParams.set('variables', variables);
  }
  if (!isEmptyValue(headers)) {
    urlSearchParams.set('headers', headers);
  }
  if (apiType) {
    urlSearchParams.set('apiType', apiType);
  }
  const qs = urlSearchParams.toString();
  return qs ? `?${qs}` : '';
}

export function getQueryParameterValues(location) {
  const params = new URLSearchParams(location.search);
  const QUERY_STRING_PARAMS = ['query', 'variables', 'headers', 'apiType'];
  const result = location.search
    ? QUERY_STRING_PARAMS.reduce(
        (output, paramName) => ({
          ...output,
          [paramName]: params.has(paramName) ? params.get(paramName) : null,
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

/**
 * Returns the preferred apiType if the given config has a route for it,
 * otherwise falls back to the first apiType that does have a route.
 * This ensures config.routerUrl[apiType] is never undefined.
 *
 * @param {String[]} configList - Parsed list of API configs
 * @param {String} preferredType - The desired API_TYPE (e.g. 'prod' or 'dev')
 * @param {String} router - Router name (e.g. 'hsl', 'waltti')
 * @param {String} apiVersion - API version (e.g. 'v1' or 'v2')
 * @param {String} dialect - API dialect (e.g. 'gtfs')
 * @param {String} dialectVersion - Dialect version (e.g. 'v1')
 * @returns {String} A valid apiType for the given config
 */
export function resolveApiType(
  configList,
  preferredType,
  router,
  apiVersion,
  dialect,
  dialectVersion,
) {
  if (
    hasRoute(
      configList,
      router,
      apiVersion,
      dialect,
      dialectVersion,
      preferredType,
    )
  ) {
    return preferredType;
  }
  return Object.keys(API_CONFIG).find(type =>
    hasRoute(configList, router, apiVersion, dialect, dialectVersion, type),
  );
}
