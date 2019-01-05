const CACHED = false;

function forceNoCacheHash(src, useCache = CACHED) {
  if (useCache) return src; // don't care about using cached assets
  const delim = src.indexOf("?") > -1 ? "&" : "?";
  return `${src}${delim}${Math.random().toString(36).substring(7)}`;
}

function addScript(src, useCache) {
  const s = document.createElement("script");
  s.setAttribute("src", forceNoCacheHash(src, useCache));
  document.body.appendChild(s);
}

function addCss(url, useCache) {
  const element = document.createElement("link");
  element.setAttribute("rel", "stylesheet");
  element.setAttribute("type", "text/css");
  element.setAttribute("href", forceNoCacheHash(url, useCache));
  document.getElementsByTagName("head")[0].appendChild(element);
}

function addHTML(url, useCache) {
  return new Promise((resolve, reject) => {
    fetch(forceNoCacheHash(url, useCache))
      .then(res => res.text())
      .then(body => {
        resolve(body);
      });
  });
}
