import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GraphiQL } from 'graphiql';
import { ToolbarMenu } from '@graphiql/react';
import 'graphiql/style.css';
import './CustomGraphiQL.css';
import {
  hasRoute,
  getPath,
  getQueryString,
  getQueryParameterValues,
  createGraphiQLFetcherWithSubscriptionKey,
} from './utils';
import { API_CONFIG, PRODUCTION_API_URL, API_TYPE } from '../config';

const GraphiQLWithCustomToolbar = ({
  alert,
  config,
  configList,
  graphiQLFetcher,
  onSelectApi,
  apiType,
  setApiType,
  query,
  variables,
  operationName,
  setQuery,
  setVariables,
  setOperationName,
}) => (
  <GraphiQL
    fetcher={graphiQLFetcher}
    initialQuery={query || undefined}
    initialVariables={variables || undefined}
    operationName={operationName || undefined}
    onEditQuery={query => setQuery(query)}
    onEditVariables={variables => setVariables(variables)}
    onEditOperationName={operationName => setOperationName(operationName)}>
    <GraphiQL.Toolbar>
      {({ merge, prettify, copy }) => (
        <>
          {prettify}
          {merge}
          {copy}
          <ToolbarMenu
            button={<div className="customgraphiql-toolbarmenu-button">EP</div>}
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
            button={
              <div className="customgraphiql-toolbarmenu-button">API</div>
            }
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
      )}
    </GraphiQL.Toolbar>
    <GraphiQL.Footer>
      <b>API:</b> {apiType ? API_CONFIG[apiType].label : ''} - <b>Endpoint:</b>{' '}
      {config.title}
    </GraphiQL.Footer>
  </GraphiQL>
);

const CustomGraphiQLWrapper = ({
  configList,
  config,
  prodSubscriptionKey,
  subscriptionKeyParam,
  devSubscriptionKey,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const values = getQueryParameterValues(location);
  const [query, setQuery] = useState(values.query);
  const [variables, setVariables] = useState(values.variables);
  const [operationName, setOperationName] = useState(values.operationName);

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
      config={config}
      configList={configList}
      graphiQLFetcher={createGraphiQLFetcherWithSubscriptionKey(
        config.routerUrl[apiType],
        subscriptionKey,
        subscriptionKeyParam,
      )}
      onSelectApi={onSelectApi}
      apiType={apiType}
      setApiType={setApiType}
      query={query}
      variables={variables}
      operationName={operationName}
      setQuery={setQuery}
      setVariables={setVariables}
      setOperationName={setOperationName}
    />
  );
};

export default ({ config, configList }) => {
  return (
    <CustomGraphiQLWrapper
      configList={configList}
      config={config}
      prodSubscriptionKey={import.meta.env.VITE_API_SUBSCRIPTION_KEY}
      devSubscriptionKey={import.meta.env.VITE_DEV_API_SUBSCRIPTION_KEY}
      subscriptionKeyParam={import.meta.env.VITE_API_SUBSCRIPTION_KEY_PARAM}
    />
  );
};
