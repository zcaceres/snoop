function searchGlobals(query: string) {

}

function searchHeaderFooterMeta(query: string) {

}

function searchJsonLD(query: string) {

}

function searchBodyText(query: string) {

}

function searchImages(query: string) {

}

// Possibly parallelize via WebWorkers?

function snoop(query: string) {
    searchGlobals(query)
    console.log("searching globals for", query)

    searchHeaderFooterMeta(query)
    console.log("searching header, footer, and meta tags for", query)
    
    searchJsonLD(query)
    console.log("searching json-ld for", query)
    
    searchBodyText(query)
    console.log("searching body text for", query)
    
    searchImages(query)
    console.log("searching images and alt tags for", query)
}

// Make the function globally available.
window.snoop = snoop