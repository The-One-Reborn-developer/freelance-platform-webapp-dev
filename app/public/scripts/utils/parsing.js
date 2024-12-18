export function getQueryParameter(name) {
    const urlParameters = new URLSearchParams(window.location.search);
    return urlParameters.get(name);
};