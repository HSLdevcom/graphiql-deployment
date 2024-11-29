export const API_VERSION_1 = 'v1';
export const API_VERSION_2 = 'v2';
export const DIALECT_VERSION_1 = 'v1';
export const PRODUCTION_API_URL = 'api.digitransit.fi';
export const DEFAULT_PATH = '/hsl';
export const API_TYPE = Object.freeze({
  DEV: 'dev',
  PROD: 'prod',
});
export const API_CONFIG = Object.freeze({
  [API_TYPE.DEV]: {
    label: 'Development',
    URL: `dev-${PRODUCTION_API_URL}`,
  },
  [API_TYPE.PROD]: {
    label: 'Production',
    URL: `${PRODUCTION_API_URL}`,
  },
});

const parseConfigs = configs =>
  configs.reduce(
    (acc, config) =>
      Object.entries(config.api).reduce(
        (acc, [apiVersion, apiConfig]) =>
          apiVersion === API_VERSION_2
            ? Object.entries(apiConfig.dialect).reduce(
                (acc, [dialectName, dialectNameConfig]) =>
                  Object.entries(dialectNameConfig).reduce(
                    (acc, [dialectVersion, dialectConfig]) => [
                      ...acc,
                      {
                        ...dialectConfig,
                        apiVersion,
                        router: config.router,
                        dialect: dialectName,
                        dialectVersion,
                        title: `${apiConfig.title} - ${dialectConfig.title}`,
                      },
                    ],
                    acc,
                  ),
                acc,
              )
            : [
                ...acc,
                {
                  ...apiConfig,
                  apiVersion,
                  router: config.router,
                  dialect: null,
                  dialectVersion: null,
                },
              ],
        acc,
      ),
    [],
  );

/**
 * @param {String} apiType API_TYPE.DEV or API_TYPE.PROD
 * @param {String} apiVersion 'v1' or 'v2'
 * @param {String} router router name (eg. 'hsl', 'waltti', ...)
 * @param {String} dialect api dialect (eg. 'gtfs' or 'transmodel')
 * @param {String} dialectVersion version of the api dialect (eg. 'v1')
 * @returns
 */
const buildUrl = (apiType, apiVersion, router, dialect, dialectVersion) => {
  const apiPath =
    apiVersion === API_VERSION_1
      ? `routers/${router}/index/graphql`
      : `${router}/${dialect}/${dialectVersion}`;
  return `https://${
    apiType === API_TYPE.DEV
      ? API_CONFIG[API_TYPE.DEV].URL
      : API_CONFIG[API_TYPE.PROD].URL
  }/routing/${apiVersion}/${apiPath}`;
};

export const CONFIGS = [
  {
    router: 'hsl',
    api: {
      [API_VERSION_1]: {
        title: 'HSL (v1 Deprecated)',
        routerUrl: {
          [API_TYPE.DEV]: buildUrl(API_TYPE.DEV, API_VERSION_1, 'hsl'),
          [API_TYPE.PROD]: buildUrl(API_TYPE.PROD, API_VERSION_1, 'hsl'),
        },
      },
      [API_VERSION_2]: {
        title: 'HSL (v2)',
        dialect: {
          gtfs: {
            [DIALECT_VERSION_1]: {
              default: true,
              title: 'GTFS (v1)',
              routerUrl: {
                [API_TYPE.DEV]: buildUrl(
                  API_TYPE.DEV,
                  API_VERSION_2,
                  'hsl',
                  'gtfs',
                  DIALECT_VERSION_1,
                ),
                [API_TYPE.PROD]: buildUrl(
                  API_TYPE.PROD,
                  API_VERSION_2,
                  'hsl',
                  'gtfs',
                  DIALECT_VERSION_1,
                ),
              },
            },
          },
        },
      },
    },
  },
  {
    router: 'waltti',
    api: {
      [API_VERSION_1]: {
        title: 'Waltti (v1 Deprecated)',
        routerUrl: {
          [API_TYPE.DEV]: buildUrl(API_TYPE.DEV, API_VERSION_1, 'waltti'),
          [API_TYPE.PROD]: buildUrl(API_TYPE.PROD, API_VERSION_1, 'waltti'),
        },
      },
      [API_VERSION_2]: {
        title: 'Waltti (v2)',
        dialect: {
          gtfs: {
            [DIALECT_VERSION_1]: {
              default: true,
              title: 'GTFS (v1)',
              routerUrl: {
                [API_TYPE.DEV]: buildUrl(
                  API_TYPE.DEV,
                  API_VERSION_2,
                  'waltti',
                  'gtfs',
                  DIALECT_VERSION_1,
                ),
                [API_TYPE.PROD]: buildUrl(
                  API_TYPE.PROD,
                  API_VERSION_2,
                  'waltti',
                  'gtfs',
                  DIALECT_VERSION_1,
                ),
              },
            },
          },
        },
      },
    },
  },
  {
    router: 'finland',
    api: {
      [API_VERSION_1]: {
        title: 'Finland (v1 Deprecated)',
        routerUrl: {
          [API_TYPE.DEV]: buildUrl(API_TYPE.DEV, API_VERSION_1, 'finland'),
          [API_TYPE.PROD]: buildUrl(API_TYPE.PROD, API_VERSION_1, 'finland'),
        },
      },
      [API_VERSION_2]: {
        title: 'Finland (v2)',
        dialect: {
          gtfs: {
            [DIALECT_VERSION_1]: {
              default: true,
              title: 'GTFS (v1)',
              routerUrl: {
                [API_TYPE.DEV]: buildUrl(
                  API_TYPE.DEV,
                  API_VERSION_2,
                  'finland',
                  'gtfs',
                  DIALECT_VERSION_1,
                ),
                [API_TYPE.PROD]: buildUrl(
                  API_TYPE.PROD,
                  API_VERSION_2,
                  'finland',
                  'gtfs',
                  DIALECT_VERSION_1,
                ),
              },
            },
          },
        },
      },
    },
  },
  {
    router: 'varely',
    api: {
      [API_VERSION_2]: {
        title: 'VARELY (v2)',
        dialect: {
          gtfs: {
            [DIALECT_VERSION_1]: {
              default: true,
              title: 'GTFS (v1)',
              routerUrl: {
                [API_TYPE.DEV]: buildUrl(
                  API_TYPE.DEV,
                  API_VERSION_2,
                  'varely',
                  'gtfs',
                  DIALECT_VERSION_1,
                ),
                [API_TYPE.PROD]: buildUrl(
                  API_TYPE.PROD,
                  API_VERSION_2,
                  'varely',
                  'gtfs',
                  DIALECT_VERSION_1,
                ),
              },
            },
          },
        },
      },
    },
  },
];

export const CONFIG_LIST = parseConfigs(CONFIGS);
