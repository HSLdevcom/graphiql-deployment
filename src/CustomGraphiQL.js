import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GraphiQL from 'graphiql';
import { ToolbarButton, ToolbarMenu } from '@graphiql/react';
import graphQLFetcher from './api/graphQLFetcher';
import 'graphiql/graphiql.css';

import { hasRoute, getPath, getQueryString } from './utils';
import { API_CONFIG, PRODUCTION_API_URL, API_TYPE } from './config';

const GraphiQLWithCustomToolbar = ({
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
    onEditOperationName={operationName => setOperationName(operationName)}
    toolbar={{
      additionalContent: (
        <>
          <ToolbarMenu
            button={<ToolbarButton>EP</ToolbarButton>}
            label={`Endpoint: ${config.title}`}>
            {configList
              .filter(configItem => Boolean(configItem.routerUrl[apiType]))
              .map(configItem => (
                <ToolbarMenu.Item
                  key={`${configItem.router}:${configItem.apiVersion}`}
                  onSelect={() =>
                    onSelectApi(
                      configItem.router,
                      configItem.apiVersion,
                      config.dialect,
                      config.dialectVersion,
                    )
                  }>
                  {configItem.title}
                </ToolbarMenu.Item>
              ))}
          </ToolbarMenu>
          <ToolbarMenu
            button={<ToolbarButton>API</ToolbarButton>}
            label={`API version: ${apiType ? API_CONFIG[apiType].label : ''}`}>
            {Object.entries(API_CONFIG).map(
              ([elementApiType, elementApiConfig]) => (
                <ToolbarMenu.Item
                  key={elementApiType}
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
                  }}>
                  {elementApiConfig.label}
                </ToolbarMenu.Item>
              ),
            )}
          </ToolbarMenu>
        </>
      ),
    }}
  />
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
    location.state?.apiType ||
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
    <GraphiQLWithCustomToolbar
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
