export function parseSearchQuery() {
  const queryString = document.location.search.substr(1);

  const qs = {};

  if (!queryString) {
    return qs;
  }

  for (const pair of queryString.split('&')) {
    const [, key, value] = pair.match(/^([^=]+)(?:=(.*))?$/);

    qs[key] = value === undefined ? true : value;
  }

  return qs;
}
