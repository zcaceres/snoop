declare global {
  interface Window {
    snoop: (query: string, options?: Partial<SnoopOptions>) => void;
  }

  const NodeFilter: {
    SHOW_ALL: number;
    SHOW_ELEMENT: number;
    SHOW_TEXT: number;
    SHOW_COMMENT: number;
    FILTER_ACCEPT: number;
    FILTER_REJECT: number;
    FILTER_SKIP: number;
  };
}

// Define NodeFilter constants if they don't exist
if (typeof NodeFilter === "undefined") {
  (global as any).NodeFilter = {
    SHOW_ALL: -1,
    SHOW_ELEMENT: 1,
    SHOW_TEXT: 4,
    SHOW_COMMENT: 128,
    FILTER_ACCEPT: 1,
    FILTER_REJECT: 2,
    FILTER_SKIP: 3,
  };
}

interface SnoopOptions {
  scripts: boolean;
  meta: boolean;
  body: boolean;
  images: boolean;
  cookies: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  windowProperties: boolean;
  attributes: boolean;
  comments: boolean;
  styles: boolean;
  urls: boolean;
  caseSensitive: boolean;
  maxDepth: number; // For object traversal
}

class DomSnoop {
  query: string;
  options: SnoopOptions;
  private searchResults: Set<string>;

  constructor(query: string, options: SnoopOptions) {
    this.query = query;
    this.options = options;
    this.searchResults = new Set();
  }

  private log(message: string) {
    this.searchResults.add(message);
    console.log(message);
  }

  private performSearch(content: string | null | undefined): boolean {
    if (!content) return false;
    const normalizedContent = this.options.caseSensitive
      ? content
      : content.toLowerCase();
    const normalizedQuery = this.options.caseSensitive
      ? this.query
      : this.query.toLowerCase();
    return normalizedContent.includes(normalizedQuery);
  }

  private searchObject(obj: any, path: string = "", depth: number = 0): void {
    if (depth >= this.options.maxDepth) return;

    try {
      for (const key in obj) {
        try {
          const value = obj[key];
          const currentPath = path ? `${path}.${key}` : key;

          if (typeof value === "string") {
            if (this.performSearch(value)) {
              this.log(`Found match: ${this.query} in ${currentPath}`);
            }
          } else if (typeof value === "object" && value !== null) {
            this.searchObject(value, currentPath, depth + 1);
          }
        } catch (e) {
          // Skip inaccessible properties
        }
      }
    } catch (e) {
      // Skip if object is not enumerable
    }
  }
  private searchLocalStorage() {
    try {
      if (!localStorage) {
        console.log("localStorage not found, skipping...");
        return;
      }

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (this.performSearch(key) || this.performSearch(value)) {
            this.log(`Found match: ${this.query} in localStorage (${key})`);
          }
        }
      }
    } catch (e) {
      // Handle case where localStorage is not available
      console.warn("localStorage not available");
    }
  }

  private searchSessionStorage() {
    try {
      if (!sessionStorage) {
        console.log("sessionStorage not found, skipping...");
        return;
      }

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const value = sessionStorage.getItem(key);
          if (this.performSearch(key) || this.performSearch(value)) {
            this.log(`Found match: ${this.query} in sessionStorage (${key})`);
          }
        }
      }
    } catch (e) {
      // Handle case where sessionStorage is not available
      console.warn("sessionStorage not available");
    }
  }

  private searchAttributes() {
    const elements = document.getElementsByTagName("*");
    for (const element of elements) {
      Array.from(element.attributes).forEach((attr) => {
        if (this.performSearch(attr.value)) {
          this.log(
            `Found match: ${this.query} in ${element.tagName.toLowerCase()} attribute: ${attr.name}`,
          );
        }
      });
    }
  }

  private searchComments() {
    const iterator = document.createNodeIterator(
      document.documentElement,
      NodeFilter.SHOW_COMMENT,
    );
    let comment;
    while ((comment = iterator.nextNode())) {
      if (this.performSearch(comment.textContent)) {
        this.log(`Found match: ${this.query} in comment`);
      }
    }
  }

  private searchStyles() {
    // Search stylesheet contents
    Array.from(document.styleSheets).forEach((stylesheet) => {
      try {
        Array.from(stylesheet.cssRules).forEach((rule) => {
          if (this.performSearch(rule.cssText)) {
            this.log(`Found match: ${this.query} in stylesheet`);
          }
        });
      } catch (e) {
        // Skip inaccessible stylesheets (CORS)
      }
    });

    // Search inline styles
    const elements = document.getElementsByTagName("*");
    for (const element of elements) {
      if (this.performSearch(element.getAttribute("style"))) {
        this.log(`Found match: ${this.query} in inline style`);
      }
    }
  }

  private searchUrls() {
    // Check current URL
    if (this.performSearch(window.location.href)) {
      this.log(`Found match: ${this.query} in URL`);
    }

    // Check all links
    const links = document.getElementsByTagName("a");
    for (const link of links) {
      if (this.performSearch(link.href)) {
        this.log(`Found match: ${this.query} in link href`);
      }
    }
  }

  private searchWindowProperties() {
    this.searchObject(window, "window");
  }

  private searchScripts() {
    // Search inline scripts
    const scriptTags = Array.from(document.getElementsByTagName("script"));
    scriptTags.forEach((script) => {
      // Check script content
      if (this.performSearch(script.innerHTML)) {
        this.log(`Found match: ${this.query} in script tag content`);
      }

      // Check script attributes (src, type, etc)
      Array.from(script.attributes).forEach((attr) => {
        if (this.performSearch(attr.value)) {
          this.log(
            `Found match: ${this.query} in script ${attr.name} attribute`,
          );
        }
      });
    });

    // Search for scripts loaded via src
    const loadedScripts = Array.from(document.scripts);
    loadedScripts.forEach((script) => {
      if (script.src && this.performSearch(script.src)) {
        this.log(`Found match: ${this.query} in script source: ${script.src}`);
      }
    });
  }

  private searchMeta() {
    const metaTags = Array.from(document.getElementsByTagName("meta"));
    metaTags.forEach((meta) => {
      // Check common meta attributes
      const attributesToCheck = [
        "name",
        "content",
        "property",
        "charset",
        "http-equiv",
      ];

      attributesToCheck.forEach((attr) => {
        const value = meta.getAttribute(attr);
        if (value && this.performSearch(value)) {
          this.log(`Found match: ${this.query} in meta ${attr} attribute`);
        }
      });
    });

    // Also check title tag
    const titleTag = document.getElementsByTagName("title")[0];
    if (titleTag && this.performSearch(titleTag.innerHTML)) {
      this.log(`Found match: ${this.query} in page title`);
    }
  }

  private searchBody() {
    // Search text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
    );

    let node;
    while ((node = walker.nextNode())) {
      if (this.performSearch(node.textContent)) {
        const parentElement = node.parentElement;
        const elementName = parentElement
          ? parentElement.tagName.toLowerCase()
          : "text";
        this.log(`Found match: ${this.query} in ${elementName} content`);
      }
    }

    // Search input values
    const inputs = Array.from(document.getElementsByTagName("input"));
    inputs.forEach((input) => {
      if (this.performSearch(input.value)) {
        this.log(`Found match: ${this.query} in input value`);
      }
      if (this.performSearch(input.placeholder)) {
        this.log(`Found match: ${this.query} in input placeholder`);
      }
    });

    // Search textarea content
    const textareas = Array.from(document.getElementsByTagName("textarea"));
    textareas.forEach((textarea) => {
      if (this.performSearch(textarea.value)) {
        this.log(`Found match: ${this.query} in textarea content`);
      }
      if (this.performSearch(textarea.placeholder)) {
        this.log(`Found match: ${this.query} in textarea placeholder`);
      }
    });
  }

  private searchImages() {
    const images = Array.from(document.getElementsByTagName("img"));
    images.forEach((img) => {
      // Check alt text
      if (this.performSearch(img.alt)) {
        this.log(`Found match: ${this.query} in image alt text`);
      }

      // Check src
      if (this.performSearch(img.src)) {
        this.log(`Found match: ${this.query} in image source`);
      }

      // Check title
      if (this.performSearch(img.title)) {
        this.log(`Found match: ${this.query} in image title`);
      }

      // Check data attributes
      Array.from(img.attributes)
        .filter((attr) => attr.name.startsWith("data-"))
        .forEach((attr) => {
          if (this.performSearch(attr.value)) {
            this.log(
              `Found match: ${this.query} in image ${attr.name} attribute`,
            );
          }
        });
    });

    // Also search background images in styles
    const elements = document.getElementsByTagName("*");
    Array.from(elements).forEach((element) => {
      const computedStyle = window.getComputedStyle(element);
      const backgroundImage = computedStyle.backgroundImage;
      if (backgroundImage !== "none" && this.performSearch(backgroundImage)) {
        this.log(`Found match: ${this.query} in background image`);
      }
    });
  }

  private searchCookies() {
    const cookies = document.cookie.split(";");
    cookies.forEach((cookie) => {
      const [name, value] = cookie.split("=").map((part) => part.trim());

      // Check cookie name
      if (this.performSearch(name)) {
        this.log(`Found match: ${this.query} in cookie name`);
      }

      // Check cookie value
      if (this.performSearch(value)) {
        this.log(`Found match: ${this.query} in cookie value`);
      }

      // Try to parse JSON values
      try {
        const parsedValue = JSON.parse(decodeURIComponent(value));
        if (typeof parsedValue === "object" && parsedValue !== null) {
          this.searchObject(parsedValue, `cookie.${name}`);
        }
      } catch {
        // Not JSON, skip
      }
    });
  }

  snoop(): Set<string> {
    if (this.options.scripts) this.searchScripts();
    if (this.options.meta) this.searchMeta();
    if (this.options.body) this.searchBody();
    if (this.options.images) this.searchImages();
    if (this.options.cookies) this.searchCookies();
    if (this.options.localStorage) this.searchLocalStorage();
    if (this.options.sessionStorage) this.searchSessionStorage();
    if (this.options.attributes) this.searchAttributes();
    if (this.options.comments) this.searchComments();
    if (this.options.styles) this.searchStyles();
    if (this.options.urls) this.searchUrls();
    if (this.options.windowProperties) this.searchWindowProperties();

    return this.searchResults;
  }

  static create(query: string, options?: Partial<SnoopOptions>) {
    const defaultOptions: SnoopOptions = {
      scripts: true,
      meta: true,
      body: true,
      images: true,
      cookies: true,
      localStorage: true,
      sessionStorage: true,
      windowProperties: true,
      attributes: true,
      comments: true,
      styles: true,
      urls: true,
      caseSensitive: false,
      maxDepth: 3,
    };
    return new DomSnoop(query, { ...defaultOptions, ...options });
  }
}

if (typeof window !== "undefined") {
  window.snoop = (query: string, options?: Partial<SnoopOptions>) =>
    DomSnoop.create(query, options).snoop();
}

export { DomSnoop };
