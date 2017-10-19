// Joy Language Editor

import * as $ from "jquery";
import { Joy } from "./engine";

export class Editor {
    // Structure is represented as nodes with 'next', 'prev' and 'parent'.
    // Lists have 'first' and 'last'. First in lists is Nil.
    // Cursor follows node.
    // Root nodes have no parent. First/last nodes have no prev/next.

    public joy: Joy;
    private root: any;
    private cursor: any;
    private selection: any;

    constructor() {
        this.joy = new Joy(this);
        this.root = { type: "Nil" };
        this.cursor = this.root;
        this.selection = { from: null, to: null };
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
        // var f = this.cursor;
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
        // var f = this.cursor;
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
        // var f = this.cursor;
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
        // var f = this.cursor;
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

    loadSource = function (source: string) {
        let tokens = this.joy.lex(source)
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

function _escape(str: string) {
    return str; // TODO: Breaks rendering of >, <, words and </b> turns into a comment?!
    //return str.replace("<", "&lt;").replace(">", "&gt;").replace("&", "&amp;");
}

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

function complete(token: any) {
    if (kind(token) == "unknown") {
        var words = editor.joy.words();
        for (var w in words) {
            var d = words[w];
            if (d.substr(0, token.length) == token)
                return d;
        }
    }
    if ("true".substr(0, token.length) == token) return "true"; // Note: Not all completions are dictionary words
    if ("false".substr(0, token.length) == token) return "false";
    if (token.substr(0, 1) == '"' && (token.length == 1 || token.substr(token.length - 1, 1) != '"')) return token + '"';
    return token;
}

function lookup(token: any) {
    var words = editor.joy.words();
    for (var w in words) {
        if (words[w] == token) return true;
    }
    return false;
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
            return editor.joy.word(token).kind;
        else
            return "unknown";
    }
}

export function update() {
    if ($("#dropdown-search").is(":focus")) return;

    render(function () {
        if (token.length > 0) {
            return "<span class='" + kind(complete(token)) + "'>" + _escape(token) + "<span class='cursor'>|</span><span class='complete'>" + complete(token).substr(token.length) + "</span></span>";
        }
        else {
            return token + "<span class='cursor'>|</span>";
        }
    });

    let root = editor.Root();
    let cursor = editor.Cursor();
    var c = code(root, cursor);
    $("#output").empty().append(c);
    editor.joy.reset();
    editor.joy.execute(c);

    const ctx = editor.joy.getStack();
    $("#context").empty();
    for (var i = 0; i < ctx.stack.length; i++) {
        const s = ctx.stack[i];
        $("#context").append("<div class='stack'/>").append(editor.joy.print([s]));
    }

    const results = editor.joy.getResultConsole();
    let r = $("#result")
    r.empty();
    r.append("<div class='stack'/>").append(results);
    r.scrollTop(r.prop("scrollHeight"));

    const display = editor.joy.getDisplayConsole();
    $("#display").empty();
    $("#display").append("<div class='stack'/>").append(display);

    const errs = editor.joy.getErrors();
    $("#error").empty();
    for (var i = 0; i < errs.length; i++) {
        const s = errs[i];
        $("#error").append("<div class='stack'/>").append(editor.joy.print([s]));
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
        case 65: // CTRL-A - Select All
            if (e.ctrlKey) {
                e.preventDefault();
                editor.SelectAll();
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
    update();
});

$(document).click(function (e) {
    let target = $(e.target)
    if (target.is('#sourceBtn')) {
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
            editor.loadSource(_source)
            token = ''
        }
    }
})

// $(document).dblclick(() => {


//     // let a = $("#dropdown-dictionary")[0].getElementsByClassName('drop-element')
//     let a = $("#dropdown-dictionary")[0].getElementsByTagName('option')
//     if (a.length < 1) {
//         console.log('no elements found on double click')
//         return
//     }

//     let source: string = ''
//     let target: any = $("#dropdown-search")[0].textContent
//     if (target === 'null') { return }
//     let idx = target.indexOf('#')
//     if (idx < 0) { return }
//     let _target: string = target.substr(idx, target.length)
//     console.log('_target = ' + _target)

//     for (let i = 0; i < a.length; i++) {
//         let val = a[i].getAttributeNode('href').value.trim()
//         console.log('href = ' + val)
//         if (_target === val) {
//             source = a[i].innerHTML
//             break;
//         }
//     }
//     if (source !== '') {
//         console.log('source = ' + source)
//         $("#dropdown-search").val(source)
//     }

// })

// function dictionaryDblClick() {
//     let a = $("#dropdown-dictionary")[0].children
//     let source = ''
//     for (i = 0; i < a.length; i++) {
//         if (a[i].baseURI === a[i].href) {
//             source = a[i].innerText
//             break;
//         }
//     }
//     if (source !== '') {
//         console.log('source = ' + source)
//         $("#dropdown-search").val(source)
//     }
// }




/*
- Not allowing definitions containing literal values
- Completion bug (fixed) with "2bi"

TODO:
- Quote/Unquote
- Copy/Paste
*/

export interface CursorFn {
    (): string;
}

