# Snoop
Snoop is like grep or ack, but for the browser.

You can search any query across various parts of a web page, including the DOM, cookies, localStorage, sessionStorage, and more.

### How to Use

1. Copy snoop.js into the browser console
2. `snoop` is now available in the global scope
3. snoop('query') will search for the query

## Features

- Search across multiple areas of a web page:
  - DOM elements and their attributes
  - Script contents
  - Meta tags
  - Body text
  - Image attributes (src, alt, title)
  - Cookies
  - localStorage and sessionStorage
  - Window properties
  - Comments
  - Styles (both inline and in stylesheets)
  - URLs (current page and links)
- Case-sensitive or case-insensitive search
- Configurable search depth for object traversal
- Easy to use directly in the browser console

## Installation

1. Clone this repository or download the source code.
2. Build the project using TypeScript:

```bash
bun run build
```

This will generate a `snoop.js` file in the `dist` directory.

## Usage

### In the Browser Console

1. Copy the contents of `dist/snoop.js` into your browser's console.
2. The `snoop` function is now available in the global scope.
3. Use it to search for any query:

```javascript
snoop('your-search-query');
```

## API

### `snoop(query: string, options?: Partial<SnoopOptions>)`

Searches the page for the given query.

- `query`: The string to search for.
- `options`: An optional object to customize the search behavior.

### `SnoopOptions`

An object with the following properties (all boolean):

- `scripts`: Search in script tags
- `meta`: Search in meta tags
- `body`: Search in body content
- `images`: Search in image attributes
- `cookies`: Search in cookies
- `localStorage`: Search in localStorage
- `sessionStorage`: Search in sessionStorage
- `windowProperties`: Search in window properties
- `attributes`: Search in element attributes
- `comments`: Search in comments
- `styles`: Search in styles
- `urls`: Search in URLs
- `caseSensitive`: Perform a case-sensitive search
- `maxDepth`: Maximum depth for object traversal

## Development

### Prerequisites

- Node.js
- Bun (for running tests)

### Setting Up the Development Environment

1. Clone the repository:

```bash
git clone https://github.com/your-username/snoop.git
cd snoop
```

2. Install dependencies:

```bash
bun install
```

### Running Tests

Tests are written using Bun's test runner. To run the tests:

```bash
bun test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
