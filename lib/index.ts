declare global {
  interface Window {
    snoop: (query: string, options?: Partial<SnoopOptions>) => void;
  }
}

interface SnoopOptions {
  scripts: boolean;
  meta: boolean;
  body: boolean;
  images: boolean;
  cookies: boolean;
  caseSensitive: boolean;
}

export class DomSnoop {
  query: string;
  options: SnoopOptions;

  constructor(query: string, options: SnoopOptions) {
    this.query = query;
    this.options = options;
  }

  performSearch(content: string) {
    const normalizedContent = this.options.caseSensitive ? content : content.toLowerCase();
    const normalizedQuery = this.options.caseSensitive ? this.query : this.query.toLowerCase();
    return normalizedContent.includes(normalizedQuery);
  }

  searchScripts() {
    const tags = Array.from(document.querySelectorAll('script'));
    tags.forEach(tag => {
      if (this.performSearch(tag.innerHTML)) {
        console.log(`Found match: ${this.query} in script tag.`);
      }
    });
  }

  searchMeta() {
    const tags = Array.from(document.querySelectorAll('meta'));
    tags.forEach(tag => {
      if (this.performSearch(tag.content)) {
        console.log(`Found match: ${this.query} in meta tag.`);
      }
    });
  }

  searchBody() {
    const body = document.body.innerText;
    if (this.performSearch(body)) {
      console.log(`Found match: ${this.query} in body.`);
    }
  }

  searchImages() {
    const tags = Array.from(document.querySelectorAll('img'));
    tags.forEach(tag => {
      if (this.performSearch(tag.alt)) {
        console.log(`Found match: ${this.query} in image alt.`);
      }
    });
  }

  searchCookies() {
    const cookies = document.cookie;
    if (this.performSearch(cookies)) {
      console.log(`Found match: ${this.query} in cookies.`);
    }
  }

  snoop() {
    if (this.options.scripts) this.searchScripts();
    if (this.options.meta) this.searchMeta();
    if (this.options.body) this.searchBody();
    if (this.options.images) this.searchImages();
    if (this.options.cookies) this.searchCookies();
  }

  static create(query: string, options?: Partial<SnoopOptions>) {
    const defaultOptions: SnoopOptions = {
      scripts: true,
      meta: true,
      body: true,
      images: true,
      cookies: true,
      caseSensitive: false,
    };
    return new DomSnoop(query, { ...defaultOptions, ...options });
  }
}

if (window) {
  window.snoop = (query: string, options?: Partial<SnoopOptions>) => DomSnoop.create(query, options).snoop();
}
