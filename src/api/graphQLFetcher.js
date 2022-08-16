export const buildHeaders = (headers) => ({
  ...(headers instanceof Object ? headers : {}),
  'Content-Type': 'application/json'
});

const graphQLFetcher =
  (apiUrl) =>
  (graphQLParams, headers = null) =>
    fetch(apiUrl, {
      method: 'post',
      headers: buildHeaders(headers),
      body: JSON.stringify(graphQLParams)
    }).then((response) => response.json());

export default graphQLFetcher;
