import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GraphiQL from 'graphiql';
import { ToolbarMenu } from '@graphiql/react';
import graphQLFetcher from './api/graphQLFetcher';
import 'graphiql/graphiql.css';

import { hasRoute } from './utils';
import {
  API_VERSION_2,
  API_CONFIG,
  PRODUCTION_API_URL,
  API_TYPE,
} from './config';

const areConfigsEqual = (config1, config2) => {
  return config1.router === config2.router &&
    Boolean(config1.api) &&
    Boolean(config2.api)
    ? config1.api === config2.api
    : true;
};

const getQueryString = (query, variables, operationName) => {
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
};

const getPath = (isDefault, router, apiVersion, dialect, dialectVersion) => {
  if (isDefault) {
    return `/${router}`;
  }

  return apiVersion === API_VERSION_2
    ? `/${router}/${apiVersion}/${dialect}/${dialectVersion}`
    : `/${router}/${apiVersion}`;
};

const PureCustomGraphiQL = ({
  config,
  configList,
  graphQLFetcher,
  query,
  variables,
  operationName,
  setQuery,
  setVariables,
  setOperationName,
  onSelectApi,
  apiType,
  setApiType,
  alert,
}) => (
  <GraphiQL
    fetcher={graphQLFetcher(config.routerUrl[apiType])}
    query={query || undefined}
    variables={variables || undefined}
    operationName={operationName || undefined}
    onEditQuery={query => setQuery(query)}
    onEditVariables={variables => setVariables(variables)}
    onEditOperationName={operationName => setOperationName(operationName)}>
    <GraphiQL.Toolbar>
      <span
        style={{
          paddingTop: 3,
        }}>
        Endpoint:
      </span>
      <ToolbarMenu
        label={config.title || 'Endpoint'}
        title="Change GraphQL endpoint">
        {configList
          .filter(it => Boolean(it.routerUrl[apiType]))
          .map(it => (
            <ToolbarMenu.Item
              key={`${it.router}:${it.apiVersion}`}
              title={it.title}
              label={it.title}
              selected={areConfigsEqual(it, config)}
              onSelect={() =>
                onSelectApi(
                  it.router,
                  it.apiVersion,
                  it.dialect,
                  it.dialectVersion,
                )
              }
            />
          ))}
      </ToolbarMenu>
      <span
        style={{
          paddingTop: 3,
        }}>
        API version:
      </span>
      <ToolbarMenu
        label={apiType ? API_CONFIG[apiType].label : 'API version'}
        title="Change API version">
        {Object.entries(API_CONFIG).map(
          ([elementApiType, elementApiConfig]) => (
            <ToolbarMenu.Item
              key={elementApiType}
              title={elementApiConfig.label}
              label={elementApiConfig.label}
              selected={apiType === elementApiType}
              onSelect={() => {
                if (
                  hasRoute(
                    configList,
                    config.router,
                    config.apiVersion,
                    config.dialect,
                    config.dialectVersion,
                    elementApiType,
                  )
                ) {
                  setApiType(elementApiType);
                } else {
                  alert(
                    `No endpoint exists for API version: ${elementApiConfig.label}`,
                  );
                }
              }}
            />
          ),
        )}
      </ToolbarMenu>
    </GraphiQL.Toolbar>
  </GraphiQL>
);

const QUERY_STRING_PARAMS = ['query', 'variables', 'operationName'];

/**
 * Get query from URL and provide update function for application
 * @param {RouterLocation} location
 */
const useQuery = location => {
  const params = new URLSearchParams(location.search);

  const initial = location.search
    ? QUERY_STRING_PARAMS.reduce(
        (output, paramName) => ({
          ...output,
          [paramName]:
            params.has(paramName) && decodeURIComponent(params.get(paramName)),
        }),
        {},
      )
    : {};

  const [query, setQuery] = useState(initial.query);
  const [variables, setVariables] = useState(initial.variables);
  const [operationName, setOperationName] = useState(initial.operationName);

  return {
    query,
    variables,
    operationName,
    setQuery,
    setVariables,
    setOperationName,
  };
};

const CustomGraphiQLWrapper = ({
  configList,
  config,
  prodSubscriptionKey,
  subscriptionKeyParam,
  devSubscriptionKey,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    query,
    variables,
    operationName,
    setQuery,
    setVariables,
    setOperationName,
  } = useQuery(location);

  const [apiType, setApiType] = useState(
    (!!location.state && location.state.apiType) ||
      (window.location.hostname === PRODUCTION_API_URL
        ? API_TYPE.PROD
        : API_TYPE.DEV),
  );

  useEffect(() => {
    const queryString = getQueryString(query, variables, operationName);
    navigate(queryString, { replace: true });
  }, [query, variables, operationName]);

  const onSelectApi = (router, apiVersion, dialect, dialectVersion) => {
    navigate({
      pathname: getPath(
        !hasRoute(
          configList,
          router,
          apiVersion,
          dialect,
          dialectVersion,
          apiType,
        ),
        router,
        apiVersion,
        dialect,
        dialectVersion,
      ),
      search: getQueryString(query, variables, operationName),
      state: { apiType },
    });
  };

  const subscriptionKey =
    apiType === API_TYPE.PROD ? prodSubscriptionKey : devSubscriptionKey;
  return (
    <PureCustomGraphiQL
      alert={alert}
      apiType={apiType}
      config={config}
      configList={configList}
      graphQLFetcher={apiUrl =>
        graphQLFetcher(apiUrl, subscriptionKey, subscriptionKeyParam)
      }
      onSelectApi={onSelectApi}
      operationName={operationName}
      query={query}
      setApiType={setApiType}
      setOperationName={setOperationName}
      setQuery={setQuery}
      setVariables={setVariables}
      variables={variables}
    />
  );
};

export default ({ config, configList }) => {
  return (
    <CustomGraphiQLWrapper
      configList={configList}
      config={config}
      prodSubscriptionKey={process.env.REACT_APP_API_SUBSCRIPTION_KEY}
      devSubscriptionKey={process.env.REACT_APP_DEV_API_SUBSCRIPTION_KEY}
      subscriptionKeyParam={process.env.REACT_APP_API_SUBSCRIPTION_KEY_PARAM}
    />
  );
};
