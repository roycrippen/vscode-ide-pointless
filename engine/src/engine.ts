// Joy Language Engine

// import { Lexer } from "./lexer"
import { Token } from "./tokens"
import { lexJoyCommands } from "./joy-lexer";
import { loadJoyprimitives } from "./primitives"
import { loadCoreLibrary } from "./joylibs"
import * as e from "./editor"

export class Joy {

    // state variables
    private dictionary: { [key: string]: any[] }
    private errors: string[]
    private results: string[]
    private context: { Stack: any[] }
    private defines: string[]
    public editor: e.Editor

    constructor(editor: e.Editor) {
        this.editor = editor;
        this.dictionary = {}
        this.errors = []
        this.results = []
        this.context = { Stack: [] }
        this.defines = []
        loadJoyprimitives(this)
        loadCoreLibrary(this)
    }

    public assertStack(length: number) {
        if (this.context.Stack.length < length) {
            this.errors.push('Stack underflow!');
        }
    }

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
    public pushResult = function (result: string) {
        this.results.push(result);
    };
    public getResults = function () {
        return this.results;
    };
    public clearResults = function () {
        this.results = [];
    };

    public concatDisplayConsole = function (displayText: string) {
        this.displayConsole = this.displayConsole.concat(displayText);
    };
    public getDisplayConsole = function () {
        return this.displayConsole;
    };
    public clearDisplayConsole = function () {
        this.displayConsole = [];
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
                case '$':
                case 'append':
                case 'empty':
                    this.pushError(`t = ${t}`);
                    break;
                default:
                    if (t !== undefined)
                        ast.push(this.word(t));
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
                else if (w.kind === 'list') j.context.Stack.unshift(w);
                else if (w.kind === 'literal') j.context.Stack.unshift(w.val);
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
                return ast;
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
        // const tokens = this.lex(source);
        const len = tokens.length;
        if (len < 5 || tokens[len - 1] !== 'define') {
            return;
        }
        const newSource = tokens.slice(1, len - 3).reduce((s, tok) => `${s} ${tok}`);
        const name: string = tokens[len - 2].replace(/"/g, '');
        const defineStr = `${name} == ${newSource}`
        this.defines.push(defineStr)
        // this.defines[name] = newSource;
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
            const args = j.context.Stack.slice(0, len).reverse(); // TODO: more efficient that slice/reverse
            j.context.Stack = j.context.Stack.slice(len);
            const result = func(...args);
            if (result) {
                if (result.kind === 'tuple') {
                    for (let i = 0; i < result.length; i += 1) {
                        j.context.Stack.unshift(result[i]);
                    }
                } else {
                    j.context.Stack.unshift(result);
                }
            }
        };
        newWord.kind = 'primitive';
        newWord.disp = name;
        this.dictionary[name] = newWord;
        return newWord;
    };

    public reset = function () {
        this.context = { Stack: [] };
    };

    public pushStack = function (val: any) {
        if (val !== null && val !== undefined) this.context.Stack.unshift(val);
    };

    public peekStack = function () {
        this.assertStack(1);
        return this.context.Stack[0];
    };

    public popStack = function () {
        this.assertStack(1);
        return this.context.Stack.shift();
    };

    public getStack = function () {
        return this.context;
    };

    public execute = function (source: string) {
        this.clearErrors();
        // this.clearResults();
        let tokens: string[] = this.lex(source);
        this.storeIfDefine(tokens);
        let ast: any = this.parse(tokens);
        this.compile(ast)(this);
    };

    public run = function (ast: any) {
        this.compile(ast)(this);
    };

    complieJoyDefines(source: string) {
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
            for (let i = 0; i < tokens.length; i++) {
                switch (tokens[i].value) {
                    case "LIBRA":
                    case "DEFINE":
                        i++;
                        let s: string = "";
                        while (i < tokens.length) {
                            let tok = tokens[i].token;
                            if (tok != Token.DOT) {
                                s += ' ' + tokens[i].value;
                                i++
                                continue;
                            } else {
                                break;
                            }
                        }
                        this.complieJoyDefines(s);
                        break;
                }
            }
        }) // foreach
    };

} // Joy



// interface Tokens {
//     token: Token
//     value: any
// }
