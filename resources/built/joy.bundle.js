/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Token values for Lexer
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Token;
(function (Token) {
    Token[Token["EOF"] = 0] = "EOF";
    Token[Token["WHITESPACE"] = 1] = "WHITESPACE";
    Token[Token["DOT"] = 2] = "DOT";
    Token[Token["COLON"] = 3] = "COLON";
    Token[Token["SEMICOLON"] = 4] = "SEMICOLON";
    Token[Token["SINGLE_QUOTE"] = 5] = "SINGLE_QUOTE";
    Token[Token["L_BRACKET"] = 6] = "L_BRACKET";
    Token[Token["R_BRACKET"] = 7] = "R_BRACKET";
    Token[Token["L_CURLY"] = 8] = "L_CURLY";
    Token[Token["R_CURLY"] = 9] = "R_CURLY";
    Token[Token["LIBRA"] = 10] = "LIBRA";
    Token[Token["DEFINE"] = 11] = "DEFINE";
    Token[Token["COMMENT"] = 12] = "COMMENT";
    Token[Token["STRING"] = 13] = "STRING";
    Token[Token["QUOTED_STRING"] = 14] = "QUOTED_STRING";
    Token[Token["NEWLINE"] = 15] = "NEWLINE";
    Token[Token["ERROR"] = 16] = "ERROR";
    Token[Token["EQEQ"] = 17] = "EQEQ";
    Token[Token["IDENTIFIER"] = 18] = "IDENTIFIER";
    Token[Token["UNKNOWN"] = 19] = "UNKNOWN";
})(Token = exports.Token || (exports.Token = {}));
exports.keywords = {
    "LIBRA": Token.LIBRA,
    "DEFINE": Token.DEFINE,
};
exports.tokToStr = {
    LIBRA: "LIBRA",
    DEFINE: "DEFINE",
    EQEQ: "==",
    L_BRACKET: "[",
    R_BRACKET: "]",
    SEMICOLON: ";",
    DOT: ".",
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// Joy Language Editor
Object.defineProperty(exports, "__esModule", { value: true });
var $ = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"jquery\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
var engine_1 = __webpack_require__(2);
var Editor = /** @class */ (function () {
    function Editor() {
        this.Root = function () {
            return this.root;
        };
        this.Cursor = function () {
            return this.cursor;
        };
        this.Selection = function () {
            var from = this.selection.from;
            var to = this.selection.to;
            function _switch() {
                var n = from;
                do {
                    if (n == to)
                        return false;
                    n = n.next;
                } while (n);
                return true;
            }
            if (_switch()) {
                return { from: to, to: this.selection.from };
            }
            return this.selection;
        };
        this.HasSelection = function () {
            return this.selection.from || this.selection.to;
        };
        this.SelectAll = function () {
            if (this.root.next) {
                this.selection.from = this.root.next;
                var to = this.selection.from;
                while (to.next)
                    to = to.next;
                this.selection.to = to;
                this.cursor = to;
            }
        };
        this.SelectNone = function () {
            this.selection.from = this.selection.to = null;
        };
        this.InsertWord = function (name) {
            var k = kind(name);
            this.SelectNone();
            // var f = this.cursor;
            var next = this.cursor.next;
            var word = { type: "Word", kind: k, name: name, prev: this.cursor, next: next, parent: this.cursor.parent };
            if (!next && word.parent)
                word.parent.last = word;
            this.cursor.next = word;
            if (next)
                next.prev = word;
            this.cursor = word;
        };
        this.InsertList = function () {
            this.SelectNone();
            var nil = { type: "Nil", parent: null };
            // var f = this.cursor;
            var next = this.cursor.next;
            var list = { type: "List", first: nil, last: nil, prev: this.cursor, next: next, parent: this.cursor.parent };
            nil.parent = list;
            if (!next && list.parent)
                list.parent.last = list;
            this.cursor.next = list;
            if (next)
                next.prev = list;
            this.cursor = nil;
        };
        this.MovePrev = function (stepIn, stepOut, select) {
            if (select)
                stepIn = stepOut = false; // Not allowed while selecting
            else
                this.SelectNone();
            // var f = this.cursor;
            if (stepIn && this.cursor.type == "List") {
                this.cursor = this.cursor.last;
                return true;
            }
            else if (this.cursor.prev) {
                if (select)
                    this.extendSelection(this.cursor, this.cursor.prev);
                this.cursor = this.cursor.prev;
                return true;
            }
            else if (stepOut && this.cursor.parent) {
                this.cursor = this.cursor.parent.prev;
                return true;
            }
            return false;
        };
        this.MoveNext = function (stepIn, stepOut, select) {
            if (select)
                stepIn = stepOut = false; // Not allowed while selecting
            else
                this.SelectNone();
            // var f = this.cursor;
            if (this.cursor.next) {
                this.cursor = this.cursor.next;
                if (stepIn && this.cursor.type == "List")
                    this.cursor = this.cursor.first;
                if (select)
                    this.extendSelection(this.cursor, this.cursor.next);
                return true;
            }
            else if (stepOut && this.cursor.parent) {
                this.cursor = this.cursor.parent;
                return true;
            }
            return false;
        };
        this.DeletePrev = function (stepIn, stepOut) {
            if (this.HasSelection()) {
                // TODO: Identical to other Delete*
                var s = this.Selection(); // Normalized
                this.cursor = s.from.prev;
                this.cursor.next = s.to.next;
                if (this.cursor.next)
                    this.cursor.next.prev = this.cursor;
                this.SelectNone();
                return true;
            }
            else {
                if (this.MovePrev(stepIn, stepOut)) {
                    if (this.cursor.next)
                        this.cursor.next = this.cursor.next.next;
                    if (this.cursor.next)
                        this.cursor.next.prev = this.cursor;
                    if (!this.cursor.next && this.cursor.parent)
                        this.cursor.parent.last = this.cursor;
                    return true;
                }
                else {
                    return false;
                }
            }
        };
        this.DeleteNext = function (stepIn, stepOut) {
            if (this.HasSelection()) {
                // TODO: Identical to other Delethiste*
                var s = this.Selection(); // Normalized
                this.cursor = s.from.prev;
                this.cursor.next = s.to.next;
                if (this.cursor.next)
                    this.cursor.next.prev = this.cursor;
                this.SelectNone();
            }
            else {
                if (this.MoveNext(stepIn, stepOut)) {
                    return this.DeletePrev(stepIn, stepOut);
                }
                else {
                    return false;
                }
            }
        };
        this.joy = new engine_1.Joy();
        this.root = { type: "Nil" };
        this.cursor = this.root;
        this.selection = { from: null, to: null };
    }
    // TODO: Simplify below once stepIn/stepOut usage is known
    Editor.prototype.extendSelection = function (to, dir) {
        if (this.selection.from == to) {
            this.selection.from = this.selection.to = null;
            return;
        }
        if (!this.selection.from)
            this.selection.from = to;
        if (this.selection.to == to)
            this.selection.to = dir;
        else
            this.selection.to = to;
    };
    return Editor;
}()); // Editor
exports.Editor = Editor;
// Render
var token = "";
var inQuote = false;
var last = 0;
var editor = new Editor();
function _escape(str) {
    return str; // TODO: Breaks rendering of >, <, words and </b> turns into a comment?!
    //return str.replace("<", "&lt;").replace(">", "&gt;").replace("&", "&amp;");
}
function render(cursorFn) {
    var cursor = editor.Cursor();
    var selection = editor.Selection();
    var from = selection.from;
    var to = selection.to;
    function _render(node, html) {
        function _cursor() {
            if (node && node == cursor)
                return cursorFn();
            else
                return "";
        }
        function _selectionFrom() {
            if (node == from)
                return "<span class='selected'>";
            else
                return "";
        }
        function _selectionTo() {
            if (node == to)
                return "</span>";
            else
                return "";
        }
        if (node) {
            switch (node.type) {
                case "List":
                    return _render(node.next, html + _selectionFrom() + "<span class='list'>" +
                        _render(node.first, "") + "</span>" + _selectionTo() + _cursor());
                case "Word":
                    return _render(node.next, html + _selectionFrom() + "<span class='" +
                        node.kind + "'>" + _escape(node.name) + "</span>" + _selectionTo() + _cursor());
                case "Nil":
                    return _render(node.next, html + _selectionFrom() + (node.next ? "" : "&nbsp;") +
                        _selectionTo() + _cursor());
                default:
                    return html;
            }
        }
        else {
            return html;
        }
    }
    $("#input").empty().append(_render(editor.Root(), ""));
}
function code(from, to) {
    var abort = false;
    function _code(node, out) {
        if (node) {
            switch (node.type) {
                case "List":
                    out += "[ " + _code(node.first, "") + "] ";
                    if (abort)
                        return out;
                    break;
                case "Word":
                    out += _escape(node.name) + " ";
                    break;
                case "Nil":
                    break;
            }
            if (node == to) {
                abort = true;
                return out;
            }
            else {
                return _code(node.next, out);
            }
        }
        else {
            return out;
        }
    }
    return _code(from, "");
}
// Input
function complete(token) {
    if (kind(token) == "unknown") {
        var words = editor.joy.words();
        for (var w in words) {
            var d = words[w];
            if (d.substr(0, token.length) == token)
                return d;
        }
    }
    if ("true".substr(0, token.length) == token)
        return "true"; // Note: Not all completions are dictionary words
    if ("false".substr(0, token.length) == token)
        return "false";
    if (token.substr(0, 1) == '"' && (token.length == 1 || token.substr(token.length - 1, 1) != '"'))
        return token + '"';
    return token;
}
function lookup(token) {
    var words = editor.joy.words();
    for (var w in words) {
        if (words[w] == token)
            return true;
    }
    return false;
}
function kind(token) {
    try {
        var t = typeof (eval(token));
        switch (t) {
            case "string":
            case "number":
            case "boolean":
                return t;
            default:
                throw "Unknown kind: '" + token + "'";
        }
    }
    catch (ex) {
        if (lookup(token))
            return editor.joy.word(token).kind;
        else
            return "unknown";
    }
}
function update() {
    if ($("#dropdown-search").is(":focus"))
        return;
    render(function () {
        if (token.length > 0) {
            return "<span class='" + kind(complete(token)) + "'>" + _escape(token) + "<span class='cursor'>|</span><span class='complete'>" + complete(token).substr(token.length) + "</span></span>";
        }
        else {
            return token + "<span class='cursor'>|</span>";
        }
    });
    var root = editor.Root();
    var cursor = editor.Cursor();
    var c = code(root, cursor);
    // var c = code(editor.Root(), editor.Cursor());
    $("#output").empty().append(c);
    editor.joy.reset();
    if (c.trim() == "words") {
        editor.joy.execute(c);
    }
    else {
        editor.joy.execute(c);
    }
    var ctx = editor.joy.getStack();
    $("#context").empty();
    for (var i = 0; i < ctx.Stack.length; i++) {
        var s = ctx.Stack[i];
        $("#context").append("<div class='stack'/>").append(editor.joy.print([s]));
    }
    $("#error").empty();
    $("#error").append("<div class='stack'/>").append(editor.joy.print([editor.joy.getErrors()]));
}
$(document).keydown(function (e) {
    if ($("#dropdown-search").is(":focus"))
        return;
    switch (e.which) {
        case 8:// Backspace
            e.preventDefault();
            if (token.length > 0)
                token = token.substr(0, token.length - 1);
            else
                editor.DeletePrev(false, false);
            break;
        case 46:// Delete
            e.preventDefault();
            editor.DeleteNext(false, false);
            break;
        case 37:// <-
            e.preventDefault();
            if (e.altKey) {
                if (!editor.MovePrev(false, false, e.shiftKey || false))
                    editor.MovePrev(false, true, e.shiftKey || false); // Step out
                while (editor.MovePrev(false, false, e.shiftKey || false))
                    ; // Move to first
            }
            else {
                editor.MovePrev(e.ctrlKey || false, true, e.shiftKey || false);
            }
            break;
        case 39:// ->
            e.preventDefault();
            if (e.altKey) {
                if (!editor.MoveNext(false, false, e.shiftKey || false))
                    editor.MoveNext(false, true, e.shiftKey || false); // Step out
                while (editor.MoveNext(false, false, e.shiftKey || false))
                    ; // Move to first
            }
            else {
                editor.MoveNext(e.ctrlKey || false, true, e.shiftKey || false);
            }
            break;
        case 65:// CTRL-A - Select All
            if (e.ctrlKey) {
                e.preventDefault();
                editor.SelectAll();
            }
            break;
    }
    $(document).focus(); // Prompts and alerts steal focus
    update();
});
$(document).keypress(function (e) {
    if ($("#dropdown-search").is(":focus"))
        return;
    e.preventDefault();
    if (inQuote) {
        switch (e.which) {
            case 34:// "
                if (last != 92 /* \ */) {
                    inQuote = false;
                    token += '"';
                    token = complete(token);
                    editor.InsertWord(token);
                    token = "";
                }
                else {
                    token += '"';
                }
                break;
            default:
                if (e.which >= 32)
                    token += String.fromCharCode(e.which);
                break;
        }
        last = e.which;
    }
    else {
        switch (e.which) {
            case 32:// space
                if (token.length > 0) {
                    token = complete(token);
                    editor.InsertWord(token);
                    token = "";
                }
                break;
            case 34:// "
                if (token.length == 0)
                    inQuote = true;
                token += '"';
                break;
            case 91:// [
                if (token.length == 0) {
                    e.preventDefault();
                    editor.InsertList();
                }
                else {
                    token += '[';
                }
                break;
            case 93:// [
                if (token.length == 0) {
                    e.preventDefault();
                    editor.MoveNext(true, true, false);
                }
                else {
                    token += ']';
                }
                break;
            default:
                if (e.which >= 32) {
                    token += String.fromCharCode(e.which);
                    editor.SelectNone();
                }
                break;
        }
    }
    update();
});
$(document).ready(function () {
    update();
});


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// Joy Language Engine
Object.defineProperty(exports, "__esModule", { value: true });
var lexer_1 = __webpack_require__(3);
var tokens_1 = __webpack_require__(0);
var primitives_1 = __webpack_require__(5);
var joylibs_1 = __webpack_require__(6);
var Joy = /** @class */ (function () {
    function Joy() {
        // error display functions
        this.pushError = function (errorText) {
            this.errors.push(errorText);
        };
        this.getErrors = function () {
            return this.errors;
        };
        this.clearErrors = function () {
            this.errors = [];
        };
        // result display from execution of '.' command
        this.pushResult = function (result) {
            this.results.push(result);
        };
        this.getResults = function () {
            return this.results;
        };
        this.clearResults = function () {
            this.results = [];
        };
        // display console, contains all results and console joy functions like 'putchars'
        this.concatDisplayConsole = function (displayText) {
            this.displayConsole = this.displayConsole.concat(displayText);
        };
        this.getDisplayConsole = function () {
            return this.displayConsole;
        };
        this.clearDisplayConsole = function () {
            this.displayConsole = [];
        };
        this.words = function () {
            var w = [];
            Object.keys(this.dictionary).forEach(function (key) {
                w.push(key);
            });
            return w;
        };
        this.getDefines = function () {
            return this.defines;
        };
        this.primitive = function (name, func) {
            // const f = func;
            var newWord = function (j) {
                var len = func.length;
                j.assertStack(len);
                var args = j.context.Stack.slice(0, len).reverse(); // TODO: more efficient that slice/reverse
                j.context.Stack = j.context.Stack.slice(len);
                var result = func.apply(void 0, args);
                if (result) {
                    if (result.kind === 'tuple') {
                        for (var i = 0; i < result.length; i += 1) {
                            j.context.Stack.unshift(result[i]);
                        }
                    }
                    else {
                        j.context.Stack.unshift(result);
                    }
                }
            };
            newWord.kind = 'primitive';
            newWord.disp = name;
            this.dictionary[name] = newWord;
            return newWord;
        };
        this.reset = function () {
            this.context = { Stack: [] };
        };
        this.pushStack = function (val) {
            if (val !== null && val !== undefined)
                this.context.Stack.unshift(val);
        };
        this.peekStack = function () {
            this.assertStack(1);
            return this.context.Stack[0];
        };
        this.popStack = function () {
            this.assertStack(1);
            return this.context.Stack.shift();
        };
        this.getStack = function () {
            return this.context;
        };
        this.execute = function (source) {
            this.clearErrors();
            this.clearResults();
            var tokens = this.lex(source);
            this.storeIfDefine(tokens);
            var ast = this.parse(tokens);
            this.compile(ast)(this);
        };
        this.run = function (ast) {
            this.compile(ast)(this);
        };
        this.lexNew = function (src) {
            var toks = [];
            var lexer = new lexer_1.Lexer(src);
            var i = 0;
            while (true) {
                var token = lexer.next();
                if (token === tokens_1.Token.EOF)
                    break;
                if (token === tokens_1.Token.WHITESPACE || token === tokens_1.Token.NEWLINE || token === tokens_1.Token.COMMENT)
                    continue;
                var value = "";
                if (token === tokens_1.Token.STRING || token === tokens_1.Token.QUOTED_STRING) {
                    value = lexer.value();
                }
                else {
                    value = tokens_1.tokToStr[tokens_1.Token[token]];
                }
                toks.push({ token: token, value: value });
                i++;
            }
            return toks;
        };
        this.processJoySource = function (source) {
            var tokens = this.lexNew(source);
            for (var i = 0; i < tokens.length; i++) {
                switch (tokens[i].value) {
                    case "LIBRA":
                    case "DEFINE":
                        i++;
                        var s = "";
                        while (i < tokens.length) {
                            var tok = tokens[i].token;
                            if (tok != tokens_1.Token.DOT) {
                                s += ' ' + tokens[i].value;
                                i++;
                                continue;
                            }
                            else {
                                break;
                            }
                        }
                        this.complieJoyDefines(s);
                        break;
                }
            }
        };
        this.dictionary = {};
        this.errors = [];
        this.results = [];
        this.context = { Stack: [] };
        this.defines = {};
        this.displayConsole = [];
        primitives_1.initialJoyprimitives(this);
        joylibs_1.loadCoreLibries(this);
    }
    Joy.prototype.assertStack = function (length) {
        if (this.context.Stack.length < length) {
            this.errors.push('Stack underflow!');
        }
    };
    // lex the joy source string
    Joy.prototype.lex = function (source) {
        if (this.errors.length > 0) {
            return [];
        }
        function isWhitespace(c) {
            return c === ' ' || c === '\n' || c === '\r' || c === '\t' || c === '\f';
        }
        var s1 = source
            .replace(/\[/g, ' [ ')
            .replace(/\]/g, ' ] ')
            .replace(/;/g, ' ; ');
        var s2 = s1 + " ";
        var tokens = [];
        var tok = '';
        var str = false;
        var last = '';
        for (var i = 0; i < s2.length; i += 1) {
            var c = s2[i];
            if (str) {
                tok += c;
                if (c === '"' && last !== '\\') {
                    tokens.push(tok);
                    tok = '';
                    str = false;
                }
                last = c;
            }
            else {
                var emptyTok = tok.length === 0;
                if (isWhitespace(c)) {
                    if (!emptyTok) {
                        tokens.push(tok);
                        tok = '';
                    }
                }
                else {
                    if (emptyTok && c === '"') {
                        str = true;
                    }
                    tok += c;
                }
            }
        }
        if (tok.length > 0)
            this.errors.push("Incomplete string token: '" + tok + "'");
        return tokens;
    };
    Joy.prototype.literal = function (val) {
        if (val.length > 1 && val[0] === '"' && val[val.length - 1] === '"') {
            var lit = val.slice(1, val.length - 1);
            return { kind: 'literal', disp: lit, val: lit };
        }
        return { kind: 'literal', disp: val, val: Number(val) };
    };
    Joy.prototype.error = function (token) {
        var e = function () {
            this.errors.push("Undefined word: '" + token + "'");
        };
        e.kind = 'error';
        e.disp = token;
        return e;
    };
    Joy.prototype.word = function (token) {
        var w = this.dictionary[token];
        if (w) {
            return w;
        }
        try {
            return this.literal(token);
        }
        catch (ex) {
            return this.error(token);
        }
    };
    Joy.prototype.parse = function (tokens) {
        var ast = [];
        ast.kind = 'list';
        while (tokens.length > 0) {
            var t = tokens.shift();
            switch (t) {
                case '[':
                    ast.push(this.parse(tokens));
                    break;
                case ']':
                    return ast;
                case '$':
                case 'append':
                case 'empty':
                    this.pushError("t = " + t);
                    break;
                default:
                    if (t !== undefined)
                        ast.push(this.word(t));
                    break;
            }
        }
        return ast;
    };
    Joy.prototype.compile = function (quote) {
        return function (j) {
            for (var i = 0; i < quote.length; i += 1) {
                var w = quote[i];
                if (typeof w === 'function')
                    w(j);
                else if (w.kind === 'list')
                    j.context.Stack.unshift(w);
                else if (w.kind === 'literal')
                    j.context.Stack.unshift(w.val);
                else
                    j.errors.push("Unexpected kind: " + w.kind);
            }
        };
    };
    Joy.prototype.print = function (ast) {
        var output = '';
        switch (typeof ast) {
            case 'number':
            case 'string':
            case 'boolean':
                return ast;
            case 'object':
                for (var i = 0; i < ast.length; i += 1) {
                    var a = ast[i];
                    if (a.kind === 'list') {
                        output += "[ " + this.print(a) + "] ";
                    }
                    else if (a.disp) {
                        output += a.disp + " ";
                    }
                    else {
                        output += a + " ";
                    }
                }
                return output;
            default:
                return '';
        }
    };
    Joy.prototype.escape = function (str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&apos;')
            .replace(/"/g, '&quot;');
    };
    Joy.prototype.render = function (ast) {
        var html = '';
        for (var i = 0; i < ast.length; i += 1) {
            var a = ast[i];
            if (a.kind === 'list') {
                html += "<span class='list'>" + this.render(a) + "</span>";
            }
            else
                html += "<span class='" + a.kind + "'>" + this.escape(a.disp) + "</span>";
        }
        return html;
    };
    Joy.prototype.define = function (quote, name) {
        var c = this.compile(quote);
        c.kind = 'secondary';
        c.disp = name;
        this.dictionary[name] = c;
    };
    // non primitive function definitions for display
    Joy.prototype.storeIfDefine = function (tokens) {
        // const tokens = this.lex(source);
        var len = tokens.length;
        if (len < 5 || tokens[len - 1] !== 'define') {
            return;
        }
        var newSource = tokens.slice(1, len - 3).reduce(function (s, tok) { return s + " " + tok; });
        var name = tokens[len - 2].replace(/"/g, '');
        this.defines[name] = newSource;
    };
    Joy.prototype.complieJoyDefines = function (source) {
        var _this = this;
        function joyDefine(s, j) {
            var xs = s.split(' ');
            var len = xs.length;
            if (len < 3) {
                return;
            }
            if (xs[1] !== '==') {
                return;
            }
            var body = xs.slice(2, len).join(' ');
            var defineText = "[ " + body + " ] \"" + xs[0] + "\" define";
            j.execute(defineText);
        }
        ;
        source.split(';').map(function (x) { return joyDefine(x.trim(), _this); });
    };
    return Joy;
}()); // Joy
exports.Joy = Joy;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Lexical scanner for the Joy language.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var utility_1 = __webpack_require__(4);
var tokens_1 = __webpack_require__(0);
var Lexer = /** @class */ (function () {
    function Lexer(src) {
        this.src = src;
        this.si = 0;
        this._prev = 0;
        this._value = "";
        this._keyword = tokens_1.Token.UNKNOWN;
    }
    Lexer.prototype.prev = function () {
        return this._prev;
    };
    Lexer.prototype.value = function () {
        return this._value;
    };
    Lexer.prototype.keyword = function () {
        return this._keyword;
    };
    Lexer.prototype.next = function () {
        this._prev = this.si;
        this._value = "";
        this._keyword = tokens_1.Token.UNKNOWN;
        if (this.si >= this.src.length)
            return tokens_1.Token.EOF;
        var c = this.src[this.si];
        if (utility_1.isWhite(c))
            return this.whitespace();
        this.si++;
        switch (c) {
            case '#':
                return this.lineComment();
            case '(':
                return this.matchChar('*') ? this.spanComment() : tokens_1.Token.STRING;
            case ';':
                return tokens_1.Token.SEMICOLON;
            case '[':
                return tokens_1.Token.L_BRACKET;
            case ']':
                return tokens_1.Token.R_BRACKET;
            case '{':
                return tokens_1.Token.L_CURLY;
            case '}':
                return tokens_1.Token.R_CURLY;
            case ':':
                return tokens_1.Token.COLON;
            case '=':
                return this.matchChar('=') ? tokens_1.Token.EQEQ : tokens_1.Token.STRING;
            case '"':
            case '\'':
                return this.quotedString(c);
            case '.':
                return tokens_1.Token.DOT;
            default:
                return this.identifier();
        }
    };
    Lexer.prototype.whitespace = function () {
        var eol = false;
        for (; utility_1.isWhite(this.src[this.si]); ++this.si)
            if (this.src[this.si] === '\n' || this.src[this.si] === '\r')
                eol = true;
        return eol ? tokens_1.Token.NEWLINE : tokens_1.Token.WHITESPACE;
    };
    Lexer.prototype.lineComment = function () {
        this.matchWhile(function (c) { return c !== '\r' && c !== '\n'; });
        return tokens_1.Token.COMMENT;
    };
    Lexer.prototype.spanComment = function () {
        while (this.si < this.src.length &&
            (this.src[this.si] !== '*' || this.src[this.si + 1] !== ')'))
            ++this.si;
        if (this.si < this.src.length)
            this.si += 2;
        return tokens_1.Token.COMMENT;
    };
    Lexer.prototype.quotedString = function (quote) {
        var str = "\"";
        while (this.si < this.src.length && this.src[this.si] !== quote)
            str += this.escape();
        this.matchChar(quote);
        str += "\"";
        this._value = str;
        return tokens_1.Token.QUOTED_STRING;
    };
    Lexer.prototype.escape = function () {
        if (!this.matchChar('\\'))
            return this.src[this.si++];
        var save = this.si;
        var d1;
        var d2;
        var d3;
        if (this.matchChar('n'))
            return '\n';
        else if (this.matchChar('r'))
            return '\r';
        else if (this.matchChar('t'))
            return '\t';
        else if (this.matchChar('\\'))
            return '\\';
        else if (this.matchChar('"'))
            return '"';
        else if (this.matchChar('\''))
            return '\'';
        else if (this.matchChar('x') &&
            null !== (d1 = this.digit(16)) && null !== (d2 = this.digit(16)))
            return String.fromCharCode(16 * d1 + d2);
        else if (null !== (d1 = this.digit(8)) && null !== (d2 = this.digit(8)) &&
            null !== (d3 = this.digit(8)))
            return String.fromCharCode(64 * d1 + 8 * d2 + d3);
        else {
            this.si = save;
            return '\\';
        }
        ;
    };
    Lexer.prototype.digit = function (radix) {
        var ASCII_ZERO = '0'.charCodeAt(0);
        var ASCII_A = 'a'.charCodeAt(0);
        var c = this.src[this.si++];
        var dig = utility_1.isDigit(c) ? c.charCodeAt(0) - ASCII_ZERO
            : utility_1.isHexDigit(c) ? 10 + c.toLowerCase().charCodeAt(0) - ASCII_A
                : 99;
        return (dig < radix) ? dig : null;
    };
    Lexer.prototype.identifier = function () {
        this.matchWhile(function (c) { return utility_1.isAlphaNum(c) || c == '_' || c == '-'; });
        this.setValue();
        this._keyword = tokens_1.keywords[this._value];
        return this._keyword ? this._keyword : tokens_1.Token.STRING;
    };
    Lexer.prototype.matchChar = function (c) {
        if (this.src[this.si] !== c)
            return false;
        ++this.si;
        return true;
    };
    Lexer.prototype.matchWhile = function (pred) {
        var start = this.si;
        while (this.si < this.src.length && pred(this.src[this.si]))
            ++this.si;
        return this.si > start;
    };
    Lexer.prototype.setValue = function () {
        this._value = this.src.substring(this._prev, this.si);
    };
    return Lexer;
}());
exports.Lexer = Lexer;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Miscellaneous string functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
function isWhite(c) {
    if (c === void 0) { c = ""; }
    var a = c.charCodeAt(0);
    return a === 32 || (9 <= a && a <= 13);
}
exports.isWhite = isWhite;
function isAlpha(char) {
    if (char && char.length === 1) {
        var code = char.charCodeAt(0);
        if (((code >= 65) && (code <= 90)) || ((code >= 97) && (code <= 122))) {
            return true;
        }
    }
    return false;
}
exports.isAlpha = isAlpha;
function isDigit(char) {
    if (char && char.length === 1) {
        var code = char.charCodeAt(0);
        if ((code >= 48) && (code <= 57)) {
            return true;
        }
    }
    return false;
}
exports.isDigit = isDigit;
function isOctalDigit(char) {
    if (char && char.length === 1) {
        var code = char.charCodeAt(0);
        if ((code >= 48) && (code <= 55)) {
            return true;
        }
    }
    return false;
}
exports.isOctalDigit = isOctalDigit;
function isHexDigit(char) {
    if (char && char.length === 1) {
        var code = char.charCodeAt(0);
        if (((code >= 48) && (code <= 57)) ||
            ((code >= 65) && (code <= 70)) ||
            ((code >= 97) && (code <= 102))) {
            return true;
        }
    }
    return false;
}
exports.isHexDigit = isHexDigit;
function isAlphaNum(char) {
    return isAlpha(char) || isDigit(char);
}
exports.isAlphaNum = isAlphaNum;
function capitalize(s) {
    return s[0].toUpperCase() + s.slice(1);
}
exports.capitalize = capitalize;
function isLower(char) {
    if (char && char.length === 1) {
        var code = char.charCodeAt(0);
        if ((code > 96) && (code < 123))
            return true;
    }
    return false;
}
exports.isLower = isLower;
function isUpper(char) {
    if (char && char.length === 1) {
        var code = char.charCodeAt(0);
        if ((code > 64) && (code < 91))
            return true;
    }
    return false;
}
exports.isUpper = isUpper;
/** should be called with i pointing at backslash */
function doesc(src, index) {
    function hexval(c) {
        var cCode = c.toLowerCase().charCodeAt(0);
        return cCode <= 57 ? cCode - 48 : cCode - 97 + 10;
    }
    function octval(c) {
        return c.charCodeAt(0) - 48;
    }
    var dstCode;
    index.i++;
    switch (src[index.i]) {
        case 'n':
            return String.fromCharCode(10);
        case 't':
            return String.fromCharCode(9);
        case 'r':
            return String.fromCharCode(13);
        case 'x':
            if (isHexDigit(src[index.i + 1]) && isHexDigit(src[index.i + 2])) {
                index.i += 2;
                dstCode = 16 * hexval(src[index.i - 1]) + hexval(src[index.i]);
                return String.fromCharCode(dstCode);
            }
            else
                break;
        case '\\':
        case '"':
        case '\'':
            return src[index.i];
        default:
            if (isOctalDigit(src[index.i]) && isOctalDigit(src[index.i + 1]) &&
                isOctalDigit(src[index.i + 2])) {
                index.i += 2;
                dstCode = 64 * octval(src[index.i - 2]) +
                    8 * octval(src[index.i - 1]) + octval(src[index.i]);
                return String.fromCharCode(dstCode);
            }
    }
    index.i--;
    return src[index.i];
}
exports.doesc = doesc;
function cmp(x, y) {
    if (x < y)
        return -1;
    else if (x > y)
        return 1;
    else
        return 0;
}
exports.cmp = cmp;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// load joy primitives into and instance of the engine
function initialJoyprimitives(j) {
    // used for testing new code
    j.primitive('aaa', function () {
        // const source = "\"(* Sample application for editor *)\n\n\\\"(* FILE:   samplelib.joy *)\n\nLIBRA\n\n    _samplelib == true; \n\n(* more \n   comments *)\n\n    new-sum == \n        0 \n        [ + ] \n        fold;   # redefine sum # #############\n\n    new-prod == 1 [ * ] fold;  # another comment \n\n    test1 == \\\"aaa \\\\\"bbb\\\\\" ccc\\\";\n    test2 == \\\"aaa  (* ccc *) ##\\\";\n\n    SAMPLELIB == \\\"samplelib.joy - simple sample library\\n\\\".\n\n(* end LIBRA *)\n\n\\\"samplelib is loaded\\n\\\" putchars.\n\"\n\n(* \n    libload - read file and add to defines\n\n    DEFINE -\n        no lines between statements\n        ';' termination except last '.'\n*)\n\nDEFINE\n    square == dup *;\n    quad == square\n            square;\n    quad-list == [ quad ] map;\n    quad-prod-sum-diff == quad-list dup new-prod swap new-sum -.\n\n[1 2 3 4 5] quad-prod-sum-diff.\n\n\n\"";
        var source = "(* Sample application for editor *)\n\n (* FILE:   samplelib.joy *)\n\nLIBRA\n\n    _samplelib == true; n\n(* more \n   comments *)\n\n    new-sum == \n        0 \n        [ + ] \n        fold;   # redefine sum # #############\n\n    new-prod == 1 [ * ] fold;  # another comment \n\n    test1 == \"aaa \\\"bbb\\\" ccc\";\n    test2 == \"aaa  (* ccc *) ##\";\n\n    SAMPLELIB == \"samplelib.joy - simple sample library\n\".\n\n(* end LIBRA *)\n\n\"samplelib is loaded\\n\" putchars.\n \n\n (* \n    libload - read file and add to defines\n\n    DEFINE -\n        no lines between statements\n        ';' termination except last '.'\n*)\n\nDEFINE\n    square == dup *;\n    quad == square\n            square;\n    quad-list == [ quad ] map;\n    quad-prod-sum-diff == quad-list dup new-prod swap new-sum -.\n\n[1 2 3 4 5] quad-prod-sum-diff.\n\n\n";
        // const source = ' \" a \\"b\\" c \" ';
        j.processJoySource(source);
    });
    // language
    j.primitive('define', function (quote, name) { j.define(quote, name); });
    // stack
    j.primitive('pop', function () { j.popStack(); });
    j.primitive('.', function (x) {
        var output = j.print(x);
        if (typeof (x) === "object" && x.kind === 'list') {
            output = "[ " + output + "]";
        }
        j.pushResult(output);
    });
    j.primitive('dup', function (x) {
        var ret = [x, x];
        ret.kind = 'tuple';
        return ret;
    });
    j.primitive('swap', function (y, x) {
        var ret = [x, y];
        ret.kind = 'tuple';
        return ret;
    });
    // stdout/stdin
    j.primitive('putchars', function (x) {
        if (typeof x !== 'string') {
            j.pushError('string needed for putchars');
            return;
        }
        j.concatDisplayConsole(j.print(x));
    });
    // combinators
    j.primitive('dip', function (x, q) {
        j.run(q);
        j.pushStack(x);
    });
    // arithmetic
    j.primitive('+', function (y, x) {
        if (typeof y === 'string' && y.length === 1 && typeof x === 'number') {
            return String.fromCharCode(y.charCodeAt(0) + x);
        }
        if (!is2Numbers(x, y)) {
            j.pushError("opperands for '+' must be numbers");
            return 0;
        }
        return y + x;
    });
    j.primitive('-', function (y, x) {
        if (typeof y === 'string' && y.length === 1 && typeof x === 'number') {
            return String.fromCharCode(y.charCodeAt(0) - x);
        }
        if (!is2Numbers(x, y)) {
            j.pushError("opperands for '-' must be numbers");
            return 0;
        }
        return y - x;
    });
    j.primitive('*', function (y, x) {
        if (!is2Numbers(x, y)) {
            j.pushError("opperands for '*' must be numbers");
            return 0;
        }
        return y * x;
    });
    j.primitive('/', function (y, x) {
        if (!is2Numbers(x, y)) {
            j.pushError("opperands for '/' must be numbers");
            return 0;
        }
        if (x === 0) {
            j.pushError("divisor for '/' must not be 0");
            return 0;
        }
        return y / x;
    });
    j.primitive('rem', function (y, x) {
        if (!is2Numbers(x, y)) {
            j.pushError("opperands for 'rem' must be numbers");
            return;
        }
        j.pushStack(y % x);
    });
    // comparison
    j.primitive('=', function (y, x) { j.pushStack(y === x); });
    j.primitive('<', function (y, x) { j.pushStack(y < x); });
    j.primitive('>', function (y, x) { j.pushStack(y > x); });
    j.primitive('<=', function (y, x) { j.pushStack(y <= x); });
    j.primitive('>=', function (y, x) { j.pushStack(y >= x); });
    // boolean/conditional
    j.primitive('true', function (x) { j.pushStack(true); });
    j.primitive('false', function (x) { j.pushStack(false); });
    j.primitive('not', function (x) { j.pushStack(!x); });
    j.primitive('and', function (y, x) { j.pushStack(y && x); });
    j.primitive('or', function (y, x) { j.pushStack(y || x); });
    j.primitive('xor', function (y, x) { j.pushStack((y || x) && !(y && x)); });
    j.primitive('iflist', function (x) { j.pushStack(typeof x === 'object' && x.kind === 'list'); });
    j.primitive('ifinteger', function (x) { j.pushStack(typeof x === 'number' && x % 1 === 0); });
    j.primitive('iffloat', function (x) { j.pushStack(typeof x === 'number' && x % 1 !== 0); });
    j.primitive('ifstring', function (x) { j.pushStack(typeof x === 'string'); });
    j.primitive('ifte', function (x, p, q) {
        j.run(x);
        var predicate = j.popStack();
        j.run(predicate ? p : q);
    });
    // lists
    j.primitive('size', function (x) { return x.length; });
    j.primitive('cons', function (x, xs) {
        if (typeof x === 'string' && x.length === 1 && typeof xs === 'string') {
            return x + xs;
        }
        if (typeof x === 'object' || !(typeof xs === 'object' && xs.kind === 'list')) {
            j.pushError("arguments for 'cons' must be a literal followed by a list/quotation");
            return xs;
        }
        xs.unshift({ val: x, kind: 'literal', disp: x.toString() });
        return xs;
    });
    j.primitive('snoc', function (xs) {
        if (typeof xs === 'string' && xs.length > 0) {
            j.pushStack(xs[0]);
            return xs.slice(1);
        }
        if (!(typeof xs === 'object' && xs.kind === 'list')) {
            j.pushError("argument for 'snoc' must be a non-empty list/quotation/string");
            return xs;
        }
        var x = xs.shift();
        j.pushStack(x.val);
        return xs;
    });
    j.primitive('concat', function (xs, ys) {
        if (typeof xs !== typeof ys) {
            j.pushError("arguments for 'conat' must be the same type");
            return xs;
        }
        if (typeof xs === 'string' && typeof ys === 'string') {
            return xs.concat(ys);
        }
        if (xs.kind !== 'list' || ys.kind !== 'list') {
            j.pushError("arguments for 'conat' must be a lists and/or quatations");
            return xs;
        }
        for (var i = 0; i < ys.length; i += 1) {
            xs.push(ys[i]);
        }
        return xs;
    });
    j.primitive('range', function (y, x) {
        var r = [];
        r.kind = 'list';
        for (var i = x; i <= y; i += 1) {
            r.push({ kind: 'literal', disp: i.toString(), val: i });
        }
        j.pushStack(r);
    });
    j.primitive('map', function (xs, q) {
        var ys = '';
        var xsCopy = xs;
        switch (typeof xs) {
            case 'string':
                for (var i = 0; i < xs.length; i += 1) {
                    j.pushStack(xs[i]);
                    j.run(q);
                    var v = j.popStack();
                    ys += v;
                }
                j.pushStack(ys);
                break;
            case 'object':
                if (xs.kind === 'list') {
                    for (var i = 0; i < xs.length; i += 1) {
                        j.pushStack(xsCopy[i].val);
                        j.run(q);
                        var v = j.popStack();
                        xsCopy[i].val = v;
                        xsCopy[i].disp = v.toString();
                    }
                    j.pushStack(xs);
                }
                break;
            default:
                j.pushError("first argument of 'map' must be a string or list/quotation");
        }
    });
    j.primitive('filter', function (xs, q) {
        var ys = '';
        switch (typeof xs) {
            case 'string':
                for (var i = 0; i < xs.length; i += 1) {
                    j.pushStack(xs[i]);
                    j.run(q);
                    if (j.popStack())
                        ys += xs[i];
                }
                j.pushStack(ys);
                break;
            case 'object':
                if (xs.kind === 'list') {
                    var f = [];
                    f.kind = 'list';
                    for (var i = 0; i < xs.length; i += 1) {
                        var x = xs[i];
                        j.pushStack(x.val);
                        j.run(q);
                        if (j.popStack())
                            f.push(x);
                    }
                    j.pushStack(f);
                }
                break;
            default:
                j.pushError("first argument of 'filter' must be a string or list/quotation");
        }
    });
    j.primitive('fold', function (xs, b, q) {
        var a = b;
        switch (typeof xs) {
            case 'string':
                for (var i = 0; i < xs.length; i += 1) {
                    j.pushStack(a);
                    j.pushStack(xs[i]);
                    j.run(q);
                    a = j.popStack();
                }
                j.pushStack(a);
                break;
            case 'object':
                if (xs.kind === 'list') {
                    for (var i = 0; i < xs.length; i += 1) {
                        j.pushStack(a);
                        j.pushStack(xs[i].val);
                        j.run(q);
                        a = j.popStack();
                    }
                    j.pushStack(a);
                }
                break;
            default:
                j.pushError("first argument of 'fold' must be a string or list/quotation");
        }
    });
    j.primitive('words', function () {
        var words = [];
        words.kind = 'list';
        j.words().forEach(function (key) {
            var func = j.word(key);
            if (func.kind === 'primitive') {
                words.push(func);
            }
        });
        words.sort(function (a, b) {
            if (a.disp > b.disp)
                return 1;
            if (a.disp < b.disp)
                return -1;
            return 0;
        });
        return words;
    });
    j.primitive('defines', function () {
        var xs = [];
        xs.kind = 'list';
        j.words().forEach(function (key) {
            var func = j.word(key);
            if (func.kind === 'secondary') {
                xs.push(func);
            }
        });
        xs.sort(function (a, b) {
            if (a.disp > b.disp)
                return 1;
            if (a.disp < b.disp)
                return -1;
            return 0;
        });
        return xs;
    });
    // utility function
    function is2Numbers(x, y) {
        return typeof x === 'number' && typeof y === 'number';
    }
} // initialJoyprimitives
exports.initialJoyprimitives = initialJoyprimitives;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// load joy primitives into and instance of the engine
function loadCoreLibries(j) {
    // core
    j.execute('[ [ ] ifte ]                           "when"      define');
    j.execute('[ [ ] swap ifte ]                      "unless"    define');
    j.execute('[ [ dup ] dip ]                        "dupd"      define');
    j.execute('[ [ keep ] dip apply ]                 "cleave"    define');
    j.execute('[ [ swap ] dip ]                       "swapd"     define');
    j.execute('[ [ true ] swap when ]                 "apply"     define');
    j.execute('[ 0 swap - ]                           "neg"       define');
    j.execute('[ dup 0 < [ neg ] when ]               "abs"       define');
    j.execute('[ dupd dip ]                           "keep"      define');
    j.execute('[ pop pop ]                            "pop2"      define');
    j.execute('[ pop pop pop ]                        "pop3"      define');
    j.execute('[ rolldown rolldown ]                  "rollup"    define');
    j.execute('[ swapd swap ]                         "rolldown"  define');
    // added for joy compatibility
    j.execute('[ swap cons ]                          "swons"     define');
    j.execute('[ [pop] dip ]                          "popd"      define');
    j.execute('[ snoc pop ]                           "first"     define');
    j.execute('[ snoc swap pop ]                      "rest"      define');
    // from joy proper libraries, added for testing
    j.execute('[ [ dup "a" >= ] [ 32 - ] [ ] ifte ]      "to-upper"             define');
    j.execute('[ [ dup "a" < ]  [ 32 + ] [ ] ifte ]      "to-lower"             define');
    // j.execute('[ "Monday" "Tuesday" "Wednesday" "Thursday" "Friday" "Saturday" "Sunday" ] "weekdays" define')
    /* eliminated
      j.execute('[ [ 2dip ] 2dip [ dip ] dip apply ]    "tri*"      define');
      j.execute('[ [ 2dip ] dip apply ]                 "2cleave*"  define');
      j.execute('[ [ 2dup ] dip 2dip ]                  "2keep"     define');
      j.execute('[ [ 2keep ] 2dip [ 2keep ] dip apply ] "2tri"      define');
      j.execute('[ [ 2keep ] dip apply ]                "2cleave"   define');
      j.execute('[ [ 3dup ] dip 3dip ]                  "3keep"     define');
      j.execute('[ [ 3keep ] 2dip [ 3keep ] dip apply ] "3tri"      define');
      j.execute('[ [ 3keep ] dip apply ]                "3cleave"   define');
      j.execute('[ [ 4dip ] 2dip [ 2dip ] dip apply ]   "2tri*"     define');
      j.execute('[ [ dip ] dip apply ]                  "cleave*"   define');
      j.execute('[ [ dup ] dip swap ]                   "over"      define');
      j.execute('[ [ keep ] 2dip [ keep ] dip apply ]   "tri"       define');
      j.execute('[ [ over ] dip swap ]                  "pick"      define');
      j.execute('[ [ pop2 ] dip ]                       "2nip"      define');
      j.execute('[ [ sum ] [ size ] cleave / ]          "average"   define');
      j.execute('[ 0 [ + ] fold ]                       "sum"       define');
      j.execute('[ 1 [ * ] fold ]                       "prod"      define');
      j.execute('[ 1 range prod ]                       "factorial" define');
      j.execute('[ cleave@ and ]                        "both?"     define');
      j.execute('[ cleave@ or ]                         "either?"   define');
      j.execute('[ dup * ]                              "square"    define');
      j.execute('[ dup 2dip apply ]                     "cleave@"   define');
      j.execute('[ dup 3dip apply ]                     "2cleave@"  define');
      j.execute('[ dup 3dip dup 2dip apply ]            "tri@"      define');
      j.execute('[ dup 4dip apply ]                     "2tri@"     define');
      j.execute('[ over over ]                          "2dup"      define');
      j.execute('[ pick pick pick ]                     "3dup"      define');
      j.execute('[ swap [ 2dip ] dip ]                  "3dip"      define');
      j.execute('[ swap [ 3dip ] dip ]                  "4dip"      define');
      j.execute('[ swap [ dip ] dip ]                   "2dip"      define');
      j.execute('[ swap pop ]                           "nip"       define');
      */
    $(document).ready(function () {
        console.debug('document ready');
        var joyStr = contentProviderCallback();
        j.processJoySource(joyStr);
        $("#dropdown-search").empty();
        var defs = j.getDefines();
        console.debug('populating dictionary dropdown');
        for (var _i = 0, _a = Object.entries(defs); _i < _a.length; _i++) {
            var _b = _a[_i], k = _b[0], v = _b[1];
            $("#dropdown-dictionary").append("<a class=\"drop-element\" href=\"#" + k + "\">" + k + " == " + v + "</a>");
        }
    });
} // loadCoreLibries
exports.loadCoreLibries = loadCoreLibries;
var getJoyFileString;
function contentProviderCallback() {
    console.debug('executing content provider callback');
    //Note: getJoyFileString is a script function within the vscode content provider 
    return getJoyFileString();
}


/***/ })
/******/ ]);
//# sourceMappingURL=joy.bundle.js.map