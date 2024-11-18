import * as React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { API_VERSION_1, CONFIG_LIST, DEFAULT_PATH } from '../config';
import { getApiConfig } from './utils';
import CustomGraphiQL from './CustomGraphiQL';

export default () => {
  const { router } = useParams();
  const config = getApiConfig(CONFIG_LIST, router, API_VERSION_1);
  if (!config) {
    return <Navigate to={DEFAULT_PATH} />;
  }
  return <CustomGraphiQL config={config} configList={CONFIG_LIST} />;
};
