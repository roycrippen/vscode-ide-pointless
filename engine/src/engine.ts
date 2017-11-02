// Joy Language Engine

// import { Lexer } from "./lexer"
import { Token } from "./tokens"
import { lexJoyCommands } from "./joy-lexer";
import { loadJoyPrimitives } from "./primitives"
import { loadCoreLibrary } from "./joylibs"
import * as e from "./editor"

export class Joy {

    // state variables
    private dictionary: { [key: string]: any[] }
    private errors: string[]
    private resultConsole: string
    private displayConsole: string
    private context: { stack: any[] }
    private defines: string[]
    public editor: e.Editor

    constructor(editor: e.Editor) {
        this.editor = editor
        this.dictionary = {}
        this.errors = []
        this.resultConsole = ""
        this.displayConsole = ""
        this.context = { stack: [] }
        this.defines = []
        loadJoyPrimitives(this)
        loadCoreLibrary(this)
    }

    public assertStack(length: number) {
        if (this.context.stack.length < length) {
            this.errors.push('Stack underflow!');
        }
    }

    public stackLength() { return this.context.stack.length }

    // error display functions
    public pushError = function (errorText: string) {
        this.errors.push(errorText);
    };
    public getErrors = function () {
        return this.errors;
    };
    public clearErrors = function () {
        this.errors = [];
    };

    // display console, contains all results and console joy functions like '.' putchars'
    public concatResult = function (result: string) {
        const _result = result.replace(/\\n|\n/g, "<br />")
        this.resultConsole = this.resultConsole.concat(_result)
    };
    public getResultConsole = function (): string {
        return this.resultConsole;
    };
    public clearResultConsole = function () {
        this.results = "";
    };

    public concatDisplayConsole = function (display: string) {
        const _display = display.replace(/\\n/g, "<br />")
        this.displayConsole = this.displayConsole.concat(_display);
    };
    public getDisplayConsole = function (): string {
        return this.displayConsole;
    };
    public clearDisplayConsole = function () {
        this.displayConsole = "";
    };

    // lex the joy source string
    lex(source: string) {
        if (this.errors.length > 0) {
            return [];
        }

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
        if (tok.length > 0) this.errors.push(`Incomplete string token: '${tok}'`);

        return tokens;
    }

    literal(val: string) {
        if (val.length > 1 && val[0] === '"' && val[val.length - 1] === '"') {
            const lit = val.slice(1, val.length - 1);
            return { kind: 'literal', disp: lit, val: lit };
        }
        return { kind: 'literal', disp: val, val: Number(val) };
    }

    error(token: string) {
        const e: any = function () {
            this.errors.push(`Undefined word: '${token}'`);
        };
        e.kind = 'error';
        e.disp = token;
        return e;
    }

    public word(token: string) {
        const w = this.dictionary[token];
        if (w) {
            return w;
        }
        try {
            return this.literal(token);
        } catch (ex) {
            return this.error(token);
        }
    }

    parse(tokens: string[]) {
        const ast: any = [];
        ast.kind = 'list';
        while (tokens.length > 0) {
            const t = tokens.shift();
            switch (t) {
                case '[':
                    ast.push(this.parse(tokens));
                    break;
                case ']':
                    return ast;
                default:
                    if (t !== undefined) {
                        let w = this.word(t)
                        ast.push(w);
                    }
                    break;
            }
        }
        return ast;
    }

    compile(quote: any) {
        return function (j: Joy) {
            for (let i = 0; i < quote.length; i += 1) {
                const w = quote[i];
                if (typeof w === 'function') w(j);
                else if (w.kind === 'list') j.context.stack.unshift(w);
                else if (w.kind === 'literal') j.context.stack.unshift(w.val);
                else j.errors.push(`Unexpected kind: ${w.kind}`);
            }
        };
    }

    public print(ast: any): string {
        let output = '';
        switch (typeof ast) {
            case 'number':
            case 'string':
            case 'boolean':
                return ast.toString();
            case 'object':
                for (let i = 0; i < ast.length; i += 1) {
                    const a = ast[i];
                    if (a.kind === 'list') {
                        output += `[ ${this.print(a)}] `;
                    } else if (a.disp) {
                        output += `${a.disp} `;
                    } else {
                        output += `${a} `;
                    }
                }
                return output;
            default:
                return '';
        }
    }

    escape(str: string) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&apos;')
            .replace(/"/g, '&quot;');
    }

    render(ast: any) {
        let html = '';
        for (let i = 0; i < ast.length; i += 1) {
            const a = ast[i];
            if (a.kind === 'list') { html += `<span class='list'>${this.render(a)}</span>`; } else html += `<span class='${a.kind}'>${this.escape(a.disp)}</span>`;
        }
        return html;
    }

    public define(quote: any, name: string) {
        const c: any = this.compile(quote);
        c.kind = 'secondary';
        c.disp = name;
        quote = repairRecursiveDefinitions(quote, c, name)
        this.dictionary[name] = c;
    }

    public words = function () {
        const w: string[] = [];
        Object.keys(this.dictionary).forEach((key) => {
            if (key !== 'define') { w.push(key) };
        });
        return w;
    };

    // non primitive function definitions for display
    storeIfDefine(tokens: string[]) {
        const len = tokens.length;
        if (len < 5 || tokens[len - 1] !== 'define') {
            return;
        }
        const newSource = tokens.slice(1, len - 3).reduce((s, tok) => `${s} ${tok}`);
        const name: string = tokens[len - 2].replace(/"/g, '');
        const defineStr = `${name} == ${newSource}`
        // todo: deal with duplicate functions like Haskell does
        const index = this.searchDefines(name)
        index == -1 ? this.defines.push(defineStr) : this.defines[index] = defineStr
    }

    searchDefines(name: string) {
        let foundIndex = -1
        this.defines.forEach((s: string, index: number) => {
            if (s.substr(0, s.search('==')).trim() == name) {
                foundIndex = index
            }
        })
        return foundIndex
    }

    public getDefines = function (): string[] {
        let xs = this.defines
        xs.sort();
        return xs;
    };


    public primitive = function (name: string, func: any) {
        // const f = func;
        const newWord: any = function (j: Joy) {
            const len = func.length;
            j.assertStack(len);
            const args = j.context.stack.slice(0, len).reverse(); // TODO: more efficient that slice/reverse
            j.context.stack = j.context.stack.slice(len);
            const result = func(...args);
            if (result !== undefined) {
                if (result.kind === 'tuple') {
                    for (let i = 0; i < result.length; i += 1) {
                        j.context.stack.unshift(result[i]);
                    }
                } else {
                    j.context.stack.unshift(result);
                }
            }
        };
        newWord.kind = 'primitive';
        newWord.disp = name;
        this.dictionary[name] = newWord;
        return newWord;
    };

    public reset = function () {
        this.context = { stack: [] };
    };

    public pushStack = function (val: any) {
        if (val !== null && val !== undefined) this.context.stack.unshift(val);
    };

    public peekStack = function () {
        this.assertStack(1);
        return this.context.stack[0];
    };

    public popStack = function () {
        this.assertStack(1);
        return this.context.stack.shift();
    };

    public getStack = function () {
        return this.context;
    };

    public setStack(stack: any) {
        this.context = stack
    }

    public execute = function (source: string) {
        this.clearErrors();
        let tokens: string[] = this.lex(source);
        this.storeIfDefine(tokens);
        let ast: any = this.parse(tokens);
        this.compile(ast)(this);
    };

    public run = function (ast: any) {
        this.compile(ast)(this);
    };

    compileJoyDefines(source: string) {
        function joyDefine(s: string, j: Joy) {
            const xs = s.split(' ');
            const len = xs.length;
            if (len < 3) {
                return;
            }
            if (xs[1] !== '==') {
                return;
            }
            const body = xs.slice(2, len).join(' ');
            const defineText = `[ ${body} ] "${xs[0]}" define`;
            j.execute(defineText);
        };

        source.split(';').map(x => joyDefine(x.trim(), this));
    }

    public processJoySource = function (source: string) {
        let sources = source
            .split(',')
            .map(x => {
                x = x.slice(1, x.length - 1)
                return x
            })
        sources.reverse()
        sources.forEach(x => {
            let tokens = lexJoyCommands(x);
            let runCommand = "";
            for (let i = 0; i < tokens.length; i++) {
                switch (tokens[i].value) {
                    case "LIBRA":
                    case "DEFINE":
                        i++;
                        let s: string = "";
                        while (i < tokens.length) {
                            let tok = tokens[i].token;
                            if (tok != Token.DOT) {
                                s += ` ${tokens[i].value}`
                                i++
                                continue;
                            } else {
                                break;
                            }
                        }
                        this.compileJoyDefines(s);
                        break;
                    case ".":
                        this.execute(`${runCommand} .`)
                        runCommand = ""
                        break
                    default:
                        runCommand += ` ${tokens[i].value}`
                }
            }
        }) // foreach
    };

} // Joy

export const jCopy = ((obj: any) => {
    switch (typeof obj) {
        case 'object':
            let newObj = $.extend(true, [], obj)
            return newObj
        default:
            return obj
    }
})

export const repairRecursiveDefinitions = ((quote: any, c: any, name: string) => {
    let path = findPropPathIfRecursive(quote, name)
    if (path != '') {
        path = path.replace(".kind", "")
        let xs = path.split(".")
        switch (xs.length) {
            case 1:
                quote[xs[0]][xs[1]] = c
                break
            case 2:
                quote[xs[0]][xs[1]] = c
                break
            case 3:
                quote[xs[0]][xs[1]][xs[2]] = c
                break
            case 4:
                quote[xs[0]][xs[1]][xs[2]][xs[3]] = c
                break
            case 5:
                quote[xs[0]][xs[1]][xs[2]][xs[3]][xs[4]] = c
                break
            case 6:
                quote[xs[0]][xs[1]][xs[2]][xs[3]][xs[4]][xs[5]] = c
                break
            case 7:
                quote[xs[0]][xs[1]][xs[2]][xs[3]][xs[4]][xs[5]][xs[6]] = c
                break
            case 8:
                quote[xs[0]][xs[1]][xs[2]][xs[3]][xs[4]][xs[5]][xs[6]][xs[7]] = c
                break
            case 9:
                quote[xs[0]][xs[1]][xs[2]][xs[3]][xs[4]][xs[5]][xs[6]][xs[7]][xs[8]] = c
                break
            case 10:
                quote[xs[0]][xs[1]][xs[2]][xs[3]][xs[4]][xs[5]][xs[6]][xs[7]][xs[8]][xs[9]] = c
                break
            default:
                console.log("recursive call deeper than expected")
        }
    }
    return quote
})

export const findPropPathIfRecursive = ((obj: any, name: string) => {
    for (var prop in obj) {
        if (obj.disp == name) {
            return prop;
        } else if (typeof obj[prop] == "object") {
            let result: string = findPropPathIfRecursive(obj[prop], name);
            if (result) {
                return prop + '.' + result;
            }
        }
    }
    return "";    // Not strictly needed, but good style
})

export const getFunctionIfRecursive = ((currentNode: any, name: string): any => {
    if (name == "") {
        return undefined
    }

    for (let i = 0; i < currentNode.length; i++) {
        let nextNode = currentNode[i]
        if (typeof nextNode == 'object') {
            if (nextNode.kind == 'list') {
                nextNode = getFunctionIfRecursive(nextNode, name)
            }
            if (typeof nextNode == 'object' && nextNode.kind == 'literal' && nextNode.disp == name) {
                return nextNode
            }
        }
    }
    return undefined
})
