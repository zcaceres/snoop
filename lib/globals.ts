const isObject = require("lodash.isobject");

const test_window = {
  thing: {
    prop1: {
      prop2: "Hello",
    }
  },
  thing2: "nice",
  thing3: {
    prop3: ['OK', "Hello", 'hello']
  }
}

function processPrimitive() {

}

function traverseObject(element: object, query: string): any {
  return Object.entries(element).map(([k, v]: [string, any]) => {
    if (k.includes(query)) console.log("found", query);
    if (isObject(v)) {
      return traverseObject(v, query)
    }
    if (typeof v === 'string' && v.includes(query)) {
      console.log("found", query);
    }
    if (Array.isArray(v)) {
      // must handle array of objects
    }
    if (typeof v === 'number' && v.toString().includes(query)) {
      console.log("found", query);
    }
    return;
  });
}

function searchGlobals(query: string) {
  // for each entry
    // is entry an object?
      // call same function
  // identify if array or primitive
  // check primitive or array for value
  return traverseObject(test_window, query);
}

searchGlobals('Hello')
