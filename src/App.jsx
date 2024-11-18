import * as React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import { API_VERSION_1, API_VERSION_2, DEFAULT_PATH } from './config';
import DefaultApiRoute from './graphiql/DefaultApiRoute';
import Version1ApiRoute from './graphiql/Version1ApiRoute';
import Version2ApiRoute from './graphiql/Version2ApiRoute';

export default () => {
  return (
    <BrowserRouter basename="/graphiql">
      <Routes>
        <Route path="*" element={<Navigate to={DEFAULT_PATH} />} />
        <Route path="/:router" element={<DefaultApiRoute />}>
          <Route
            path={`/:router/${API_VERSION_1}`}
            element={<Version1ApiRoute />}
          />
          <Route
            path={`/:router/${API_VERSION_2}/:dialect/:dialectVersion`}
            element={<Version2ApiRoute />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
