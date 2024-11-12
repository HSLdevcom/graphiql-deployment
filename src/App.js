import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import { API_VERSION_1, API_VERSION_2 } from './config';
import DefaultApiRoute from './DefaultApiRoute';
import Version1ApiRoute from './Version1ApiRoute';
import Version2ApiRoute from './Version2ApiRoute';

export default () => {
  return (
    <BrowserRouter basename="/graphiql">
      <Routes>
        <Route path="/" exact element={<Navigate to="/hsl" />} />
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
