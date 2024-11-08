/* eslint-disable import/prefer-default-export */
import { API_VERSION_2 } from './config';

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
