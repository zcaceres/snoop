"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomSnoop = void 0;
class DomSnoop {
    constructor(query, options) {
        this.query = query;
        this.options = options;
    }
    searchScripts() {
        const tags = Array.from(document.querySelectorAll('script'));
        tags.forEach(tag => {
            const content = this.options.caseSensitive ? tag.innerHTML : tag.innerHTML.toLowerCase();
            const query = this.options.caseSensitive ? this.query : this.query.toLowerCase();
            if (content.includes(query)) {
                console.log(`Found match: ${this.query} in script tag.`);
            }
        });
    }
    searchMeta() {
        const tags = Array.from(document.querySelectorAll('meta'));
        tags.forEach(tag => {
            const content = this.options.caseSensitive ? tag.content : tag.content.toLowerCase();
            const query = this.options.caseSensitive ? this.query : this.query.toLowerCase();
            if (content.includes(query)) {
                console.log(`Found match: ${this.query} in meta tag.`);
            }
        });
    }
    searchBody() {
        const body = this.options.caseSensitive ? document.body.innerText : document.body.innerText.toLowerCase();
        const query = this.options.caseSensitive ? this.query : this.query.toLowerCase();
        if (body.includes(query)) {
            console.log(`Found match: ${this.query} in body.`);
        }
    }
    searchImages() {
        const tags = Array.from(document.querySelectorAll('img'));
        tags.forEach(tag => {
            const alt = this.options.caseSensitive ? tag.alt : tag.alt.toLowerCase();
            const query = this.options.caseSensitive ? this.query : this.query.toLowerCase();
            if (alt.includes(query)) {
                console.log(`Found match: ${this.query} in image alt.`);
            }
        });
    }
    searchCookies() {
        const cookies = this.options.caseSensitive ? document.cookie : document.cookie.toLowerCase();
        const query = this.options.caseSensitive ? this.query : this.query.toLowerCase();
        if (cookies.includes(query)) {
            console.log(`Found match: ${this.query} in cookies.`);
        }
    }
    snoop() {
        if (this.options.scripts)
            this.searchScripts();
        if (this.options.meta)
            this.searchMeta();
        if (this.options.body)
            this.searchBody();
        if (this.options.images)
            this.searchImages();
        if (this.options.cookies)
            this.searchCookies();
    }
    static create(query, options) {
        const defaultOptions = {
            scripts: true,
            meta: true,
            body: true,
            images: true,
            cookies: true,
            caseSensitive: false,
        };
        return new DomSnoop(query, Object.assign(Object.assign({}, defaultOptions), options));
    }
}
exports.DomSnoop = DomSnoop;
if (window) {
    window.snoop = (query, options) => DomSnoop.create(query, options).snoop();
}
//# sourceMappingURL=index.js.map