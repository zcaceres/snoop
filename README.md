# Snoop
Snoop is a powerful tool for searching the DOM, similar to how grep or ack works for file systems. It's like grep or ack, but for the DOM.

### Features
Search for a query string in script tags, meta tags, body text, image alt attributes, and cookies.
Case sensitivity can be toggled on or off.
Each search area (scripts, meta tags, body, images, cookies) can be included or excluded from the search.
The search results are logged to the consol

### Installation
To install Snoop, you can use npm:
`npm install snoop`

### Usage
You can use Snoop directly in the browser:

`window.snoop('query', options);`

The `options` object is optional and can include the following properties:

scripts: Whether to search in script tags (default: true).
meta: Whether to search in meta tags (default: true).
body: Whether to search in the body (default: true).
images: Whether to search in image alt attributes (default: true).
cookies: Whether to search in cookies (default: true).
caseSensitive: Whether the search should be case sensitive (default: false).
Development
To develop Snoop, you can clone the repository and install the dependencies:

```
git clone https://github.com/zcaceres/snoop.git
cd snoop
npm install
```

Then, you can use the following npm scripts:

`npm run test`: Run the tests (currently not implemented).
`npm run lint`: Lint the code with ESLint.
`npm run build`: Build the code with TypeScript.
`npm run start`: Start the TypeScript compiler in watch mode.

### License
Snoop is open source software licensed as MIT.
