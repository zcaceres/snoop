var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
if (typeof NodeFilter === "undefined") {
    global.NodeFilter = {
        SHOW_ALL: -1,
        SHOW_ELEMENT: 1,
        SHOW_TEXT: 4,
        SHOW_COMMENT: 128,
        FILTER_ACCEPT: 1,
        FILTER_REJECT: 2,
        FILTER_SKIP: 3,
    };
}
var DomSnoop = (function () {
    function DomSnoop(query, options) {
        this.query = query;
        this.options = options;
        this.searchResults = new Set();
        this.visitedNodes = new WeakSet();
        this.visitedPaths = new Set();
    }
    DomSnoop.prototype.log = function (message) {
        this.searchResults.add(message);
        console.log(message);
    };
    DomSnoop.prototype.performSearch = function (content) {
        if (!content)
            return false;
        var normalizedContent = this.options.caseSensitive
            ? content
            : content.toLowerCase();
        var normalizedQuery = this.options.caseSensitive
            ? this.query
            : this.query.toLowerCase();
        return normalizedContent.includes(normalizedQuery);
    };
    DomSnoop.prototype.searchObject = function (obj, path, depth) {
        if (path === void 0) { path = ""; }
        if (depth === void 0) { depth = 0; }
        if (depth >= this.options.maxDepth)
            return;
        try {
            if (obj instanceof Node) {
                if (this.visitedNodes.has(obj)) {
                    return;
                }
                this.visitedNodes.add(obj);
            }
            for (var key in obj) {
                try {
                    var value = obj[key];
                    var currentPath = path ? "".concat(path, ".").concat(key) : key;
                    if (this.visitedPaths.has(currentPath)) {
                        continue;
                    }
                    if (typeof value === "string") {
                        if (this.performSearch(value)) {
                            this.visitedPaths.add(currentPath);
                            this.log("Found match: ".concat(this.query, " in ").concat(currentPath));
                        }
                    }
                    else if (typeof value === "object" && value !== null) {
                        if (value instanceof Node) {
                            if (!this.visitedNodes.has(value)) {
                                this.searchObject(value, currentPath, depth + 1);
                            }
                        }
                        else {
                            this.searchObject(value, currentPath, depth + 1);
                        }
                    }
                }
                catch (e) {
                }
            }
        }
        catch (e) {
        }
    };
    DomSnoop.prototype.getNodePath = function (node) {
        var parts = [];
        var current = node;
        while (current && current !== document) {
            if (current instanceof Element) {
                var part = current.tagName.toLowerCase();
                if (current.id) {
                    part += "#".concat(current.id);
                }
                else if (current.className) {
                    part += ".".concat(current.className.split(" ").join("."));
                }
                parts.unshift(part);
            }
            current = current.parentNode;
        }
        return parts.join(" > ");
    };
    DomSnoop.prototype.searchLocalStorage = function () {
        try {
            if (!localStorage) {
                console.log("localStorage not found, skipping...");
                return;
            }
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key) {
                    var value = localStorage.getItem(key);
                    if (this.performSearch(key) || this.performSearch(value)) {
                        this.log("Found match: ".concat(this.query, " in localStorage (").concat(key, ")"));
                    }
                }
            }
        }
        catch (e) {
            console.warn("localStorage not available");
        }
    };
    DomSnoop.prototype.searchSessionStorage = function () {
        try {
            if (!sessionStorage) {
                console.log("sessionStorage not found, skipping...");
                return;
            }
            for (var i = 0; i < sessionStorage.length; i++) {
                var key = sessionStorage.key(i);
                if (key) {
                    var value = sessionStorage.getItem(key);
                    if (this.performSearch(key) || this.performSearch(value)) {
                        this.log("Found match: ".concat(this.query, " in sessionStorage (").concat(key, ")"));
                    }
                }
            }
        }
        catch (e) {
            console.warn("sessionStorage not available");
        }
    };
    DomSnoop.prototype.searchAttributes = function () {
        var e_1, _a;
        var _this = this;
        var elements = document.getElementsByTagName("*");
        var _loop_1 = function (element) {
            Array.from(element.attributes).forEach(function (attr) {
                if (_this.performSearch(attr.value)) {
                    _this.log("Found match: ".concat(_this.query, " in ").concat(element.tagName.toLowerCase(), " attribute: ").concat(attr.name));
                }
            });
        };
        try {
            for (var elements_1 = __values(elements), elements_1_1 = elements_1.next(); !elements_1_1.done; elements_1_1 = elements_1.next()) {
                var element = elements_1_1.value;
                _loop_1(element);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (elements_1_1 && !elements_1_1.done && (_a = elements_1.return)) _a.call(elements_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    DomSnoop.prototype.searchComments = function () {
        var iterator = document.createNodeIterator(document.documentElement, NodeFilter.SHOW_COMMENT);
        var comment;
        while ((comment = iterator.nextNode())) {
            if (this.performSearch(comment.textContent)) {
                this.log("Found match: ".concat(this.query, " in comment"));
            }
        }
    };
    DomSnoop.prototype.searchStyles = function () {
        var e_2, _a;
        var _this = this;
        Array.from(document.styleSheets).forEach(function (stylesheet) {
            try {
                Array.from(stylesheet.cssRules).forEach(function (rule) {
                    if (_this.performSearch(rule.cssText)) {
                        _this.log("Found match: ".concat(_this.query, " in stylesheet"));
                    }
                });
            }
            catch (e) {
            }
        });
        var elements = document.getElementsByTagName("*");
        try {
            for (var elements_2 = __values(elements), elements_2_1 = elements_2.next(); !elements_2_1.done; elements_2_1 = elements_2.next()) {
                var element = elements_2_1.value;
                if (this.performSearch(element.getAttribute("style"))) {
                    this.log("Found match: ".concat(this.query, " in inline style"));
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (elements_2_1 && !elements_2_1.done && (_a = elements_2.return)) _a.call(elements_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    DomSnoop.prototype.searchUrls = function () {
        var e_3, _a;
        if (this.performSearch(window.location.href)) {
            this.log("Found match: ".concat(this.query, " in URL"));
        }
        var links = document.getElementsByTagName("a");
        try {
            for (var links_1 = __values(links), links_1_1 = links_1.next(); !links_1_1.done; links_1_1 = links_1.next()) {
                var link = links_1_1.value;
                if (this.performSearch(link.href)) {
                    this.log("Found match: ".concat(this.query, " in link href"));
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (links_1_1 && !links_1_1.done && (_a = links_1.return)) _a.call(links_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    DomSnoop.prototype.searchWindowProperties = function () {
        this.searchObject(window, "window");
    };
    DomSnoop.prototype.searchScripts = function () {
        var _this = this;
        var scriptTags = Array.from(document.getElementsByTagName("script"));
        scriptTags.forEach(function (script) {
            if (_this.performSearch(script.innerHTML)) {
                _this.log("Found match: ".concat(_this.query, " in script tag content"));
            }
            Array.from(script.attributes).forEach(function (attr) {
                if (_this.performSearch(attr.value)) {
                    _this.log("Found match: ".concat(_this.query, " in script ").concat(attr.name, " attribute"));
                }
            });
        });
        var loadedScripts = Array.from(document.scripts);
        loadedScripts.forEach(function (script) {
            if (script.src && _this.performSearch(script.src)) {
                _this.log("Found match: ".concat(_this.query, " in script source: ").concat(script.src));
            }
        });
    };
    DomSnoop.prototype.searchMeta = function () {
        var _this = this;
        var metaTags = Array.from(document.getElementsByTagName("meta"));
        metaTags.forEach(function (meta) {
            var attributesToCheck = [
                "name",
                "content",
                "property",
                "charset",
                "http-equiv",
            ];
            attributesToCheck.forEach(function (attr) {
                var value = meta.getAttribute(attr);
                if (value && _this.performSearch(value)) {
                    _this.log("Found match: ".concat(_this.query, " in meta ").concat(attr, " attribute"));
                }
            });
        });
        var titleTag = document.getElementsByTagName("title")[0];
        if (titleTag && this.performSearch(titleTag.innerHTML)) {
            this.log("Found match: ".concat(this.query, " in page title"));
        }
    };
    DomSnoop.prototype.searchBody = function () {
        var _this = this;
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        var node;
        while ((node = walker.nextNode())) {
            if (this.performSearch(node.textContent)) {
                var parentElement = node.parentElement;
                var elementName = parentElement
                    ? parentElement.tagName.toLowerCase()
                    : "text";
                this.log("Found match: ".concat(this.query, " in ").concat(elementName, " content"));
            }
        }
        var inputs = Array.from(document.getElementsByTagName("input"));
        inputs.forEach(function (input) {
            if (_this.performSearch(input.value)) {
                _this.log("Found match: ".concat(_this.query, " in input value"));
            }
            if (_this.performSearch(input.placeholder)) {
                _this.log("Found match: ".concat(_this.query, " in input placeholder"));
            }
        });
        var textareas = Array.from(document.getElementsByTagName("textarea"));
        textareas.forEach(function (textarea) {
            if (_this.performSearch(textarea.value)) {
                _this.log("Found match: ".concat(_this.query, " in textarea content"));
            }
            if (_this.performSearch(textarea.placeholder)) {
                _this.log("Found match: ".concat(_this.query, " in textarea placeholder"));
            }
        });
    };
    DomSnoop.prototype.searchImages = function () {
        var _this = this;
        var images = Array.from(document.getElementsByTagName("img"));
        images.forEach(function (img) {
            if (_this.performSearch(img.alt)) {
                _this.log("Found match: ".concat(_this.query, " in image alt text"));
            }
            if (_this.performSearch(img.src)) {
                _this.log("Found match: ".concat(_this.query, " in image source"));
            }
            if (_this.performSearch(img.title)) {
                _this.log("Found match: ".concat(_this.query, " in image title"));
            }
            Array.from(img.attributes)
                .filter(function (attr) { return attr.name.startsWith("data-"); })
                .forEach(function (attr) {
                if (_this.performSearch(attr.value)) {
                    _this.log("Found match: ".concat(_this.query, " in image ").concat(attr.name, " attribute"));
                }
            });
        });
        var elements = document.getElementsByTagName("*");
        Array.from(elements).forEach(function (element) {
            var computedStyle = window.getComputedStyle(element);
            var backgroundImage = computedStyle.backgroundImage;
            if (backgroundImage !== "none" && _this.performSearch(backgroundImage)) {
                _this.log("Found match: ".concat(_this.query, " in background image"));
            }
        });
    };
    DomSnoop.prototype.searchCookies = function () {
        var _this = this;
        var cookies = document.cookie.split(";");
        cookies.forEach(function (cookie) {
            var _a = __read(cookie.split("=").map(function (part) { return part.trim(); }), 2), name = _a[0], value = _a[1];
            if (_this.performSearch(name)) {
                _this.log("Found match: ".concat(_this.query, " in cookie name"));
            }
            if (_this.performSearch(value)) {
                _this.log("Found match: ".concat(_this.query, " in cookie value"));
            }
            try {
                var parsedValue = JSON.parse(decodeURIComponent(value));
                if (typeof parsedValue === "object" && parsedValue !== null) {
                    _this.searchObject(parsedValue, "cookie.".concat(name));
                }
            }
            catch (_b) {
            }
        });
    };
    DomSnoop.prototype.snoop = function () {
        this.visitedNodes = new WeakSet();
        this.visitedPaths = new Set();
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
        if (this.options.localStorage)
            this.searchLocalStorage();
        if (this.options.sessionStorage)
            this.searchSessionStorage();
        if (this.options.attributes)
            this.searchAttributes();
        if (this.options.comments)
            this.searchComments();
        if (this.options.styles)
            this.searchStyles();
        if (this.options.urls)
            this.searchUrls();
        if (this.options.windowProperties)
            this.searchWindowProperties();
        return this.searchResults;
    };
    DomSnoop.create = function (query, options) {
        var defaultOptions = {
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
        return new DomSnoop(query, __assign(__assign({}, defaultOptions), options));
    };
    return DomSnoop;
}());
if (typeof window !== "undefined") {
    window.snoop = function (query, options) { return DomSnoop.create(query, options).snoop(); };
}
export { DomSnoop };
