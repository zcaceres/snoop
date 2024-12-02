/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, describe, beforeEach, afterEach, it, mock } from "bun:test";
import { DomSnoop } from "../lib";
import { JSDOM } from "jsdom";

describe("DomSnoop", () => {
  let dom: JSDOM;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let originalWindow: any;

  beforeEach(() => {
    // Store original window if it exists
    originalWindow = global.window;

    // Set up a fresh DOM for each test
    dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="description" content="Test content with secret-value">
          <style>
            .secret-class { color: red; }
          </style>
          <script>
            const sensitiveData = 'secret-value';
          </script>
        </head>
        <body>
          <div id="main" data-secret="secret-value">
            <img src="test.jpg" alt="secret-value-alt">
            <a href="https://example.com/secret-value">Link</a>
            <!-- This is a secret-value comment -->
            <div style="content: 'secret-value';">
              Some text with secret-value
            </div>
          </div>
        </body>
      </html>
    `,
      {
        url: "https://example.org/",
        referrer: "https://example.com/",
        contentType: "text/html",
      },
    );

    // HACK: We coerce the JSDOM window object into the global Window object just for ease of testing. They have significant areas where they do not overlap!
    global.window = dom.window as unknown as Window & typeof globalThis;
    global.document = dom.window.document;

    // Mock localStorage
    const localStorageMock = {
      getItem: mock(() => "secret-value"),
      setItem: mock(() => {}),
      length: 1,
      key: mock(() => "testKey"),
      removeItem: mock(() => {}),
      clear: mock(() => {}),
    };
    Object.defineProperty(global.window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    // Mock sessionStorage
    const sessionStorageMock = {
      getItem: mock(() => "secret-value"),
      setItem: mock(() => {}),
      length: 1,
      key: mock(() => "testKey"),
      removeItem: mock(() => {}),
      clear: mock(() => {}),
    };
    Object.defineProperty(global.window, "sessionStorage", {
      value: sessionStorageMock,
      writable: true,
    });

    global.localStorage = window.localStorage;
    global.sessionStorage = window.sessionStorage;

    // Mock cookies
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "testCookie=secret-value",
    });

    // @ts-expect-error - We're adding a global property for testing purposes
    global.cookie = document.cookie;
  });

  afterEach(() => {
    // Restore original window
    global.window = originalWindow;
    mock.restore();
  });

  describe("constructor", () => {
    it("should create instance with default options", () => {
      const snoop = DomSnoop.create("test");
      expect(snoop).toBeInstanceOf(DomSnoop);
    });

    it("should override default options", () => {
      const snoop = DomSnoop.create("test", { caseSensitive: true });
      expect(snoop.options.caseSensitive).toBe(true);
    });
  });

  describe("search functionality", () => {
    const query = "secret-value";
    let snoop: DomSnoop;

    beforeEach(() => {
      snoop = DomSnoop.create(query);
    });

    it("should find matches in meta tags", () => {
      const results = snoop.snoop();
      expect(Array.from(results).some((r) => r.includes("meta"))).toBe(true);
    });

    it("should find matches in scripts", () => {
      const results = snoop.snoop();
      expect(Array.from(results).some((r) => r.includes("script tag"))).toBe(
        true,
      );
    });

    it("should find matches in body text", () => {
      const results = snoop.snoop();
      expect(Array.from(results).some((r) => r.includes("div"))).toBe(true);
    });

    it("should find matches in image alt text", () => {
      const results = snoop.snoop();
      expect(Array.from(results).some((r) => r.includes("image alt"))).toBe(
        true,
      );
    });

    it("should find matches in cookies", () => {
      const results = snoop.snoop();
      console.log(results);
      expect(Array.from(results).some((r) => r.includes("cookie"))).toBe(true);
    });

    it("should find matches in localStorage", () => {
      const results = snoop.snoop();
      expect(Array.from(results).some((r) => r.includes("localStorage"))).toBe(
        true,
      );
    });

    it("should find matches in sessionStorage", () => {
      const results = snoop.snoop();
      expect(
        Array.from(results).some((r) => r.includes("sessionStorage")),
      ).toBe(true);
    });

    it("should find matches in attributes", () => {
      const results = snoop.snoop();
      expect(Array.from(results).some((r) => r.includes("attribute"))).toBe(
        true,
      );
    });

    it("should find matches in comments", () => {
      const results = snoop.snoop();
      expect(Array.from(results).some((r) => r.includes("comment"))).toBe(true);
    });

    it("should find matches in styles", () => {
      const results = snoop.snoop();
      expect(Array.from(results).some((r) => r.includes("style"))).toBe(true);
    });

    it("should find matches in URLs", () => {
      const results = snoop.snoop();
      expect(Array.from(results).some((r) => r.includes("link href"))).toBe(
        true,
      );
    });
  });

  describe("case sensitivity", () => {
    it("should respect case sensitivity option", () => {
      const caseSensitiveSnoop = DomSnoop.create("SECRET-VALUE", {
        caseSensitive: true,
      });
      const caseInsensitiveSnoop = DomSnoop.create("SECRET-VALUE", {
        caseSensitive: false,
      });

      const sensitiveResults = caseSensitiveSnoop.snoop();
      const insensitiveResults = caseInsensitiveSnoop.snoop();

      expect(sensitiveResults.size).toBeLessThan(insensitiveResults.size);
    });
  });

  describe("error handling", () => {
    it("should handle inaccessible properties gracefully", () => {
      // Create a property that throws when accessed
      Object.defineProperty(global.window, "throwingProp", {
        get: () => {
          throw new Error("Cannot access");
        },
      });

      const snoop = DomSnoop.create("secret-value");
      expect(() => snoop.snoop()).not.toThrow();
    });

    it("should handle null and undefined values", () => {
      (global.window as any).nullProp = null;
      (global.window as any).undefinedProp = undefined;

      const snoop = DomSnoop.create("secret-value");
      expect(() => snoop.snoop()).not.toThrow();
    });
  });

  // Performance tests specific to Bun
  describe("performance", () => {
    it("should complete search within reasonable time", async () => {
      const start = performance.now();
      const snoop = DomSnoop.create("secret-value");
      snoop.snoop();
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should complete within 100ms
    });
  });
});
