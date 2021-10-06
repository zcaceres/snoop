"use strict";
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
};
function processPrimitive() {
}
function traverseObject(element, query, keys) {
    return Object.entries(element).map(([k, v]) => {
        keys = [...keys, k.toString()];
        if (k.includes(query)) {
            console.log("found in key", keys.join('.'), query);
        }
        if (isObject(v)) {
            return traverseObject(v, query, keys);
        }
        if (typeof v === 'string' && v.includes(query)) {
            console.log("found str", keys.join('.'), query);
        }
        if (typeof v === 'number' && v.toString().includes(query)) {
            console.log("found number", keys.join('.'), query);
        }
        return;
    });
}
function searchGlobals(query) {
    // for each entry
    // is entry an object?
    // call same function
    // identify if array or primitive
    // check primitive or array for value
    return traverseObject(test_window, query, []);
}
searchGlobals('Hello');
//# sourceMappingURL=globals.js.map