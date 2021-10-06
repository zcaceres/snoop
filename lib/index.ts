interface SnoopOptions {
  asSubstring: boolean;
  globals: boolean;
  scripts: boolean;
  meta: boolean;
  body: boolean;
  images: boolean;
  cookies: boolean;
}


function formatFoundMessage(element: string, match: string, msg: string | undefined = '') {
  console.log(`Found match: ${match} in element ${element}. ${msg}`)
}

function searchGlobals(query: string) {
  return traverseObjectFor(window, query);
  // traverse tree of properties recursively
  // if found, print message


}

function traverseObjectFor(obj: object, query: string) {

}


function searchScripts(query: string) {
  const tags = Array.from(document.querySelectorAll('script'));
}

function searchMeta(query: string) {
  const tags = Array.from(document.querySelectorAll('meta'));

}

function searchBodyText(query: string) {
  const body = document.querySelector('body');
  const text = body ? body.textContent : '';

}

function searchImages(query: string) {
  const tags = Array.from(document.querySelectorAll('img'));
}

function searchCookies(query: string) {
  const text = document.cookie;
}

// Possibly parallelize via WebWorkers?

function snoop(query: string, options: SnoopOptions = {
  asSubstring: false,
  globals: true,
  scripts: true,
  meta: true,
  body: true,
  images: true,
  cookies: true,
}) {
  if (options.globals) searchGlobals(query);
  console.log("searching globals for", query);

  if (options.scripts) searchScripts(query);
  console.log("searching scripts for", query);

  if (options.meta) searchMeta(query);
  console.log("searching meta for", query);

  if (options.body) searchBodyText(query);
  console.log("searching body text for", query);

  if (options.images) searchImages(query);
  console.log("searching images and alt tags for", query);

  if (options.cookies) searchCookies(query);
}

// Make the function globally available.
if (window) {
  window.snoop = snoop;
}

