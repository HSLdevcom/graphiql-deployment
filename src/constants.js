export const API_VERSION_1 = 'v1';
export const API_VERSION_2 = 'v2';
export const DIALECT_VERSION_1 = 'v1';
export const PRODUCTION_API_URL = 'api.digitransit.fi'
export const API_TYPE = Object.freeze({
  DEV: 'dev',
  PROD: 'prod'
});
export const API_CONFIG = Object.freeze({
  [API_TYPE.DEV]: {
    label: 'Development',
    URL: `dev-${PRODUCTION_API_URL}`
  },
  [API_TYPE.PROD]: {
    label: 'Production',
    URL: `${PRODUCTION_API_URL}`
  }
});
