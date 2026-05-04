import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GraphiQL } from 'graphiql';
import { ToolbarButton, ToolbarMenu } from '@graphiql/react';
import 'graphiql/style.css';
import './CustomGraphiQL.css';
import {
  hasRoute,
  getPath,
  getQueryString,
  getQueryParameterValues,
  resolveApiType,
  createGraphiQLFetcherWithSubscriptionKey,
} from './utils';
import { API_CONFIG, PRODUCTION_API_URL, API_TYPE } from '../config';

const GraphiQLWithCustomToolbar = ({
  config,
  configList,
  graphiQLFetcher,
  onSelectApi,
  apiType,
  setApiType,
  query,
  variables,
  headers,
  setQuery,
  setVariables,
  setHeaders,
}) => (
  <GraphiQL
    fetcher={graphiQLFetcher}
    initialQuery={query || undefined}
    initialVariables={variables || undefined}
    initialHeaders={headers || undefined}
    onEditQuery={query => setQuery(query)}
    onEditVariables={variables => setVariables(variables)}
    onEditHeaders={headers => setHeaders(headers)}>
    <GraphiQL.Toolbar>
      {({ merge, prettify, copy }) => (
        <>
          {prettify}
          {merge}
          {copy}
          <ToolbarMenu
            button={
              <ToolbarButton label={`Endpoint: ${config.title}`}>
                <div className="customgraphiql-toolbarmenu-button">EP</div>
              </ToolbarButton>
            }>
            {configList.map(configItem => (
              <ToolbarMenu.Item
                key={`${configItem.router}:${configItem.apiVersion}`}
                onSelect={() =>
                  onSelectApi(
                    configItem.router,
                    configItem.apiVersion,
                    configItem.dialect,
                    configItem.dialectVersion,
                  )
                }>
                {configItem.title}
              </ToolbarMenu.Item>
            ))}
          </ToolbarMenu>
          <ToolbarMenu
            button={
              <ToolbarButton
                label={`API type: ${apiType ? API_CONFIG[apiType].label : ''}`}>
                <div className="customgraphiql-toolbarmenu-button">API</div>
              </ToolbarButton>
            }>
            {Object.entries(API_CONFIG)
              .filter(([elementApiType]) =>
                hasRoute(
                  configList,
                  config.router,
                  config.apiVersion,
                  config.dialect,
                  config.dialectVersion,
                  elementApiType,
                ),
              )
              .map(([elementApiType, elementApiConfig]) => (
                <ToolbarMenu.Item
                  key={elementApiType}
                  onSelect={() => setApiType(elementApiType)}>
                  {elementApiConfig.label}
                </ToolbarMenu.Item>
              ))}
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
  const [headers, setHeaders] = useState(values.headers);

  const [apiType, setApiType] = useState(
    resolveApiType(
      configList,
      values.apiType ||
        (window.location.hostname === PRODUCTION_API_URL
          ? API_TYPE.PROD
          : API_TYPE.DEV),
      config.router,
      config.apiVersion,
      config.dialect,
      config.dialectVersion,
    ),
  );

  useEffect(() => {
    navigate(
      { search: getQueryString(query, variables, headers, apiType) },
      { replace: true },
    );
  }, [query, variables, headers, apiType]);

  const onSelectApi = (router, apiVersion, dialect, dialectVersion) => {
    const resolvedApiType = resolveApiType(
      configList,
      apiType,
      router,
      apiVersion,
      dialect,
      dialectVersion,
    );
    setApiType(resolvedApiType);
    navigate({
      pathname: getPath(
        !hasRoute(
          configList,
          router,
          apiVersion,
          dialect,
          dialectVersion,
          resolvedApiType,
        ),
        router,
        apiVersion,
        dialect,
        dialectVersion,
      ),
      search: getQueryString(query, variables, headers, resolvedApiType),
    });
  };

  const subscriptionKey =
    apiType === API_TYPE.PROD ? prodSubscriptionKey : devSubscriptionKey;
  return (
    <GraphiQLWithCustomToolbar
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
      headers={headers}
      setQuery={setQuery}
      setVariables={setVariables}
      setHeaders={setHeaders}
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
