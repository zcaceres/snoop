# snoop
Like grep or ack... for the DOM

## Spec

### How to use
```js
snoop('token', { asSubstring: true })
```

Will return 'token' as a data attribute of any node, as a property on the Window object, in any urls on any tags, and in any JSON that can be found and parsed in the HTML.

- Must be case insensitive ('TOKEN', 'token', and 'Token' all found).
- Optionally finds as a substring (configurable)
- Shows the result in context and makes it easy to find the reference
