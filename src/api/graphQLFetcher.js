export const buildHeaders = (headers) => ({
  ...(headers instanceof Object ? headers : {}),
  'Content-Type': 'application/json'
});

export const addSubscriptionKey = (
  apiUrl,
  key,
  keyParam = 'subscription-key'
) => {
  const url = new URL(apiUrl);
  if (key && keyParam) {
    url.searchParams.set(keyParam, key);
  }
  return url;
};

export const buildRequest = (
  apiUrl,
  subscriptionKey,
  subscriptionKeyParam,
  graphQLParams,
  headers
) =>
  new Request(
    addSubscriptionKey(apiUrl, subscriptionKey, subscriptionKeyParam),
    {
      method: 'post',
      headers: buildHeaders(headers),
      body: JSON.stringify(graphQLParams)
    }
  );

const graphQLFetcher =
  (apiUrl, subscriptionKey, subscriptionKeyParam = 'subscription-key') =>
  (graphQLParams, headers = null) =>
    fetch(
      buildRequest(
        apiUrl,
        subscriptionKey,
        subscriptionKeyParam,
        graphQLParams,
        headers
      )
    ).then((response) => response.json());

export default graphQLFetcher;
