// Joy Language Editor

import * as $ from "jquery";
import { log } from "util";
// import { Joy } from "./engine";

export class Editor {
    // Structure is represented as nodes with 'next', 'prev' and 'parent'.
    // Lists have 'first' and 'last'. First in lists is Nil.
    // Cursor follows node.
    // Root nodes have no parent. First/last nodes have no prev/next.

    private root: any;
    private cursor: any;
    private selection: any;
    public wordsP: { [key: string]: Dictionary }

    constructor() {
        this.root = { type: "Nil" };
        this.cursor = this.root;
        this.selection = { from: null, to: null };
        this.wordsP = {}
    }

    deleteAll = (() => {
        this.root = { type: "Nil" };
        this.cursor = this.root;
        this.selection = { from: null, to: null };
    })

    Root = function () {
        return this.root;
    };

    Cursor = function () {
        return this.cursor;
    };

    Selection = function () {
        var from = this.selection.from;
        var to = this.selection.to;

        function _switch() {
            var n = from;
            do {
                if (n == to) return false;
                n = n.next;
            } while (n);
            return true;
        }

        if (_switch()) {
            return { from: to, to: this.selection.from };
        }

        return this.selection;
    };

    HasSelection = function () {
        return this.selection.from || this.selection.to;
    }

    SelectAll = function () {
        if (this.root.next) {
            this.selection.from = this.root.next;
            var to = this.selection.from;
            while (to.next) to = to.next;
            this.selection.to = to;
            this.cursor = to;
        }
    };

    SelectNone = function () {
        this.selection.from = this.selection.to = null;
    };

    InsertWord = function (name: string) {
        var k = kind(name);
        this.SelectNone();
        var next = this.cursor.next;
        var word = { type: "Word", kind: k, name: name, prev: this.cursor, next: next, parent: this.cursor.parent };
        if (!next && word.parent)
            word.parent.last = word;
        this.cursor.next = word;
        if (next) next.prev = word;
        this.cursor = word;
    };

    InsertList = function () {
        this.SelectNone();
        var nil: { type: string, parent: any } = { type: "Nil", parent: null };
        var next = this.cursor.next;
        var list = { type: "List", first: nil, last: nil, prev: this.cursor, next: next, parent: this.cursor.parent };
        nil.parent = list;
        if (!next && list.parent)
            list.parent.last = list;
        this.cursor.next = list;
        if (next) next.prev = list;
        this.cursor = nil;
    };

    // TODO: Simplify below once stepIn/stepOut usage is known

    extendSelection(to: any, dir: any) {
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
    }

    MovePrev = function (stepIn: boolean, stepOut: boolean, select: boolean) {
        if (select) stepIn = stepOut = false; // Not allowed while selecting
        else this.SelectNone();
        if (stepIn && this.cursor.type == "List") {
            this.cursor = this.cursor.last;
            return true;
        }
        else if (this.cursor.prev) {
            if (select) this.extendSelection(this.cursor, this.cursor.prev);
            this.cursor = this.cursor.prev;
            return true;
        }
        else if (stepOut && this.cursor.parent) {
            this.cursor = this.cursor.parent.prev;
            return true;
        }
        return false;
    };

    MoveNext = function (stepIn: boolean, stepOut: boolean, select: boolean) {
        if (select) stepIn = stepOut = false; // Not allowed while selecting
        else this.SelectNone();
        if (this.cursor.next) {
            this.cursor = this.cursor.next;
            if (stepIn && this.cursor.type == "List")
                this.cursor = this.cursor.first;
            if (select) this.extendSelection(this.cursor, this.cursor.next);
            return true;
        }
        else if (stepOut && this.cursor.parent) {
            this.cursor = this.cursor.parent;
            return true;
        }
        return false;
    };

    DeletePrev = function (stepIn: boolean, stepOut: boolean) {
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
                if (this.cursor.next) this.cursor.next = this.cursor.next.next;
                if (this.cursor.next) this.cursor.next.prev = this.cursor;
                if (!this.cursor.next && this.cursor.parent)
                    this.cursor.parent.last = this.cursor;
                return true;
            }
            else {
                return false;
            }
        }
    };

    DeleteNext = function (stepIn: boolean, stepOut: boolean) {
        if (this.HasSelection()) {
            // TODO: Identical to other Delete*
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

    loadSource = function (source: string) {
        let tokens = lex(source)
        // this.deleteAll()
        for (let i = 0; i < tokens.length; i += 1) {
            let token = tokens[i]
            switch (token) {
                case '[':
                    this.InsertList()
                    break;
                case ']':
                    this.MoveNext(false, true, false)
                    break;
                default:
                    this.InsertWord(token)
            }
        }
        update()
    }


} // Editor

// Render

let token: string = "";
let inQuote: boolean = false;
let last: number = 0;
let editor: Editor = new Editor();

let ws: any = undefined;

function render(cursorFn: CursorFn) {
    var cursor = editor.Cursor();
    var selection = editor.Selection();
    var from = selection.from;
    var to = selection.to;

    function _render(node: any, html: string): string {
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
                        node.kind + "'>" + node.name + "</span>" + _selectionTo() + _cursor());
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

function code(from: any, to: any) {
    var abort = false;

    function _code(node: any, out: any): any {
        if (node) {
            switch (node.type) {
                case "List":
                    out += "[ " + _code(node.first, "") + "] ";
                    if (abort) return out;
                    break;
                case "Word":
                    out += node.name + " ";
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

function complete(token: any) {
    var words = editor.wordsP;
    for (var w in words) {
        var d = words[w];
        if (d.name.substr(0, token.length) == token)
            return d.name;
    }
    if ("true".substr(0, token.length) == token) return "true"; // Note: Not all completions are dictionary words
    if ("false".substr(0, token.length) == token) return "false";
    if (token.substr(0, 1) == '"' && (token.length == 1 || token.substr(token.length - 1, 1) != '"')) return token + '"';
    return token;
}

function lookup(token: any) {
    if (typeof token != 'string') {
        return false
    }
    return editor.wordsP.hasOwnProperty(token)
}

function kind(token: any) {
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
            return editor.wordsP[token].kind;
        else
            return "unknown";
    }
}

export function update() {
    if ($("#dropdown-search").is(":focus")) return;

    render(function () {
        if (token.length > 0) {
            return "<span class='" + kind(complete(token)) + "'>" + token + "<span class='cursor'>|</span><span class='complete'>" + complete(token).substr(token.length) + "</span></span>";
        }
        else {
            return token + "<span class='cursor'>|</span>";
        }
    });

    let root = editor.Root();
    let cursor = editor.Cursor();
    var c = code(root, cursor);
    $("#output").empty().append(c);

    if (ws != undefined) {
        ws.send("run: " + c)
        console.debug("message to websocket server: " + "run: " + c)
    }
}

$(document).keydown(function (e) {
    if ($("#dropdown-search").is(":focus")) return;

    switch (e.which) {
        case 8: // Backspace
            e.preventDefault();
            if (token.length > 0)
                token = token.substr(0, token.length - 1);
            else
                editor.DeletePrev(false, false);
            break;
        case 46: // Delete
            e.preventDefault();
            editor.DeleteNext(false, false);
            break;
        case 37: // <-
            e.preventDefault();
            if (e.altKey) {
                if (!editor.MovePrev(false, false, e.shiftKey || false)) // At first already?
                    editor.MovePrev(false, true, e.shiftKey || false); // Step out
                while (editor.MovePrev(false, false, e.shiftKey || false)); // Move to first
            }
            else {
                editor.MovePrev(e.ctrlKey || false, true, e.shiftKey || false);
            }
            break;
        case 39: // ->
            e.preventDefault();
            if (e.altKey) {
                if (!editor.MoveNext(false, false, e.shiftKey || false)) // At first already?
                    editor.MoveNext(false, true, e.shiftKey || false); // Step out
                while (editor.MoveNext(false, false, e.shiftKey || false)); // Move to first
            }
            else {
                editor.MoveNext(e.ctrlKey || false, true, e.shiftKey || false);
            }
            break;
        default:
            break;
    }
    $(document).focus(); // Prompts and alerts steal focus
    update();
});

$(document).keypress(function (e) {
    if ($("#dropdown-search").is(":focus")) return;

    e.preventDefault();
    if (inQuote) {
        switch (e.which) {
            case 34: // "
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
                if (e.which >= 32) // not control char
                    token += String.fromCharCode(e.which);
                break;
        }
        last = e.which;
    }
    else { // !inQuote
        switch (e.which) {
            case 32: // space
                if (token.length > 0) {
                    token = complete(token);
                    editor.InsertWord(token);
                    token = "";
                }
                break;
            case 34: // "
                if (token.length == 0)
                    inQuote = true;
                token += '"';
                break;
            case 91: // [
                if (token.length == 0) {
                    e.preventDefault();
                    editor.InsertList();
                }
                else {
                    token += '[';
                }
                break;
            case 93: // [
                if (token.length == 0) {
                    e.preventDefault();
                    editor.MoveNext(true, true, false);
                }
                else {
                    token += ']';
                }
                break;
            default:
                if (e.which >= 32) { // not control char
                    token += String.fromCharCode(e.which);
                    editor.SelectNone();
                }
                break;
        }
    }
    update();
});

$(document).ready(function () {
    connect()
});

function connect() {
    ws = new WebSocket('ws://localhost:9160/');

    ws.onopen = function () {
        ws.send("pointless_connection");
        console.log("connect to websocket server");
        ws.onmessage = function (event: any) {
            console.log(event.data)
            if (event.data == "pointless") {
                ws.onmessage = onMessage;
                let pointlessStr = (window as any).getJoyFileString()

                ws.send('load: ' + pointlessStr)

                // render(function () {
                //     if (token.length > 0) {
                //         return "<span class='" + kind(complete(token)) + "'>" + token + "<span class='cursor'>|</span><span class='complete'>" + complete(token).substr(token.length) + "</span></span>";
                //     }
                //     else {
                //         return token + "<span class='cursor'>|</span>";
                //     }
                // });
            } else {
                console.log("unknown response " + event.data);
                ws.close();
            }
        };
    };

    ws.onclose = function () {
        connect()
    }

}


// var getJoyFileString: any;
// function contentProviderCallback() {
//     console.debug('executing content provider callback');
//     //Note: getJoyFileString is a script function within the vscode content provider 
//     return getJoyFileString();
// }

function onMessage(event: any) {
    const response = JSON.parse(event.data)

    var keys = Object.keys(response);

    if (keys.length == 0) {
        console.log("error, unknown message: " + event.data)
    }

    switch (keys[0]) {
        case "stack":
            $("#context").empty();
            for (var i = 0; i < response.stack.length; i++) {
                const s = response.stack[i];
                $("#context").append("<div class='stack'/>").append(s);
            }

            let r = $("#result")
            r.empty();
            r.append("<div class='stack'/>").append(response.display);  // todo rename display to result in haskell
            r.scrollTop(r.prop("scrollHeight"));

            $("#error").empty();
            for (var i = 0; i < response.errors.length; i++) {
                const s = response.errors[i];
                $("#error").append("<div class='stack'/>").append(s);
            }
            break
        case "vocab":
            $("#dropdown-search").empty();
            $("#dropdown-dictionary").empty();
            var defs = response.vocab
            console.debug('populating dictionary dropdown');
            for (var i = 0; i < defs.length; i++) {
                const def = defs[i].trim()
                const idx = defs[i].indexOf('==')
                const key: string = def.slice(0, idx).trim()
                let value = defs[i].replace("== [", "== ").trim()
                if (def.slice(idx + 3, idx + 12) == 'Primitive') {
                    editor.wordsP[key] = { kind: "primitive", name: key }
                } else {
                    editor.wordsP[key] = { kind: "secondary", name: key }
                    value = value.slice(0, -1)
                }
                $("#dropdown-dictionary").append(`<a class=\"drop-element\" href=\"#${key}\"> ${value} </a>`);
            }
            break
        case "load":
            console.log(event.data["load"])
            break
        default:
            console.log("unknown json keys ")
            console.log(keys);
            break
    }
}


$(document).click(function (e) {
    let target = $(e.target)
    if (target.is('#source-button')) {
        let source = $('#dropdown-search').val()
        let _source = ''
        switch (typeof source) {
            case 'object':
            case 'undefined':
                return
            case 'number':
                _source = source == undefined ? '' : source.toString()
                break
            default:
                _source = typeof source == 'string' ? source : ''
        }

        let idx = _source.indexOf('==')
        if (idx != -1) {
            _source = _source.substr(idx + 2)
        }
        editor.loadSource(_source)
        token = ''
    }
})

$(document).dblclick(function (e) {
    let parent = e.target.parentElement
    if (parent != null && parent.id == 'dropdown-dictionary') {
        let source = e.target.outerText
        console.log('source = ' + source)
        $("#dropdown-search").val(source)
    }
})

interface CursorFn {
    (): string;
}

interface Dictionary {
    kind: string,
    name: string
}


// lex the pointless source string
function lex(source: string) {
    function isWhitespace(c: string) {
        return c === ' ' || c === '\n' || c === '\r' || c === '\t' || c === '\f';
    }
    const s1 = source
        .replace(/\[/g, ' [ ')
        .replace(/\]/g, ' ] ')
        .replace(/;/g, ' ; ');
    const s2 = `${s1} `;
    const tokens = [];
    let tok = '';
    let str = false;
    let last = '';
    for (let i = 0; i < s2.length; i += 1) {
        const c = s2[i];
        if (str) {
            tok += c;
            if (c === '"' && last !== '\\') {
                tokens.push(tok);
                tok = '';
                str = false;
            }
            last = c;
        } else {
            const emptyTok = tok.length === 0;
            if (isWhitespace(c)) {
                if (!emptyTok) {
                    tokens.push(tok);
                    tok = '';
                }
            } else {
                if (emptyTok && c === '"') {
                    str = true;
                }
                tok += c;
            }
        }
    }
    return tokens;
}

