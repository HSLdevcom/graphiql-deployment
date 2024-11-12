import React from 'react';
import { useParams } from 'react-router-dom';
import { API_VERSION_2, CONFIG_LIST } from '../config';
import { getApiConfig } from './utils';
import CustomGraphiQL from './CustomGraphiQL';

export default () => {
  const { router, dialect, dialectVersion } = useParams();
  const config = getApiConfig(
    CONFIG_LIST,
    router,
    API_VERSION_2,
    dialect,
    dialectVersion,
  );
  return <CustomGraphiQL config={config} configList={CONFIG_LIST} />;
};
