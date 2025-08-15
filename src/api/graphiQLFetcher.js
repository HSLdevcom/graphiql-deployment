export const buildHeaders = headers => ({
  ...(headers instanceof Object ? headers : {}),
  'Content-Type': 'application/json',
});

export const addSubscriptionKey = (apiUrl, key, keyParam) => {
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
  graphiQLParams,
  headers,
) =>
  new Request(
    addSubscriptionKey(
      apiUrl,
      subscriptionKey,
      subscriptionKeyParam || 'subscription-key',
    ),
    {
      method: 'post',
      headers: buildHeaders(headers),
      body: JSON.stringify(graphiQLParams),
    },
  );

const graphiQLFetcher =
  (apiUrl, subscriptionKey, subscriptionKeyParam = 'subscription-key') =>
  (graphiQLParams, headers = null) =>
    fetch(
      buildRequest(
        apiUrl,
        subscriptionKey,
        subscriptionKeyParam,
        graphiQLParams,
        headers,
      ),
    ).then(response => response.json());

export default graphiQLFetcher;
