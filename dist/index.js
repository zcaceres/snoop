"use strict";
function formatFoundMessage(element, match, msg = '') {
    console.log(`Found match: ${match} in element ${element}. ${msg}`);
}
function searchGlobals(query) {
    return traverseObjectFor(window, query);
    // traverse tree of properties recursively
    // if found, print message
}
function traverseObjectFor(obj, query) {
}
function searchScripts(query) {
    const tags = Array.from(document.querySelectorAll('script'));
}
function searchMeta(query) {
    const tags = Array.from(document.querySelectorAll('meta'));
}
function searchBodyText(query) {
    const body = document.querySelector('body');
    const text = body ? body.textContent : '';
}
function searchImages(query) {
    const tags = Array.from(document.querySelectorAll('img'));
}
function searchCookies(query) {
    const text = document.cookie;
}
// Possibly parallelize via WebWorkers?
function snoop(query, options = {
    asSubstring: false,
    globals: true,
    scripts: true,
    meta: true,
    body: true,
    images: true,
    cookies: true,
}) {
    if (options.globals)
        searchGlobals(query);
    console.log("searching globals for", query);
    if (options.scripts)
        searchScripts(query);
    console.log("searching scripts for", query);
    if (options.meta)
        searchMeta(query);
    console.log("searching meta for", query);
    if (options.body)
        searchBodyText(query);
    console.log("searching body text for", query);
    if (options.images)
        searchImages(query);
    console.log("searching images and alt tags for", query);
    if (options.cookies)
        searchCookies(query);
}
// Make the function globally available.
window.snoop = snoop;
//# sourceMappingURL=index.js.map