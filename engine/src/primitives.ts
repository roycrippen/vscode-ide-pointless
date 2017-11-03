import { Joy, jCopy } from "./engine"
import { update } from "./editor"
import * as $ from "jquery";

// load joy primitives into and instance of the engine
export function loadJoyPrimitives(j: Joy) {

    // language
    j.primitive('define', (quote: any, name: string) => { j.define(quote, name); })

    // recursive lib function - limited by js stack
    // j.primitive('while', (b: any, d: any) => {
    //     while (true) {
    //         // preserve the stack
    //         j.execute('stack')
    //         const oldStackList: any = jCopy(j.popStack())

    //         j.run(b)
    //         const result: boolean = j.popStack()

    //         // restore the stack
    //         j.execute('newstack')
    //         j.pushStack(oldStackList)
    //         j.execute('unstack')
    //         if (!result) {
    //             break
    //         }
    //         j.run(d)
    //     }
    // })

    j.primitive('linrec', (p: any, t: any, r1: any, r2: any) => {
        const oldStack = copyStack()
        j.run(p)
        const result: boolean = j.popStack()
        replaceStack(oldStack)
        if (result) {
            j.run(t)
        } else {
            j.run(r1)
            j.pushStack(p)
            j.pushStack(t)
            j.pushStack(r1)
            j.pushStack(r2)
            j.execute('linrec')
            return j.run(r2)
        }
    })

    // stack
    j.primitive('pop', () => { j.popStack(); });

    j.primitive('dup', (x: any) => {
        let xCopy = x;
        if (typeof (x) === 'object') {
            xCopy = jCopy(x)
        }
        const ret: any = [x, xCopy];
        ret.kind = 'tuple';
        return ret;

    })

    j.primitive('swap', (y: any, x: any) => {
        const ret: any = [x, y];
        ret.kind = 'tuple';
        return ret;
    });

    j.primitive('unstack', (xs: any) => {
        if (typeof (xs) !== 'object' || xs.kind !== 'list') {
            j.pushError('primitive unstack', 'unstack requires a list');
            return
        }
        while (j.stackLength() > 0) {
            j.popStack()
        }
        for (let i = xs.length - 1; i >= 0; i -= 1) {
            j.pushStack(xs[i])
        }
    })

    j.primitive('stack', () => {
        let list: any = []
        list.kind = 'list'
        while (j.stackLength() > 0) {
            list.push(j.popStack())
        }
        for (let i = list.length - 1; i >= 0; i -= 1) {
            j.pushStack(list[i])
        }
        j.pushStack(list)
    })

    // stdout/stdin
    j.primitive('put', (_x: any) => {
        if (!isLiteral(_x)) {
            j.pushError('primitive put', 'number, boolean or single character string needed for put');
            return
        }

        const x = getLiteral(_x)
        switch (typeof (x)) {
            case "number":
            case "boolean":
                j.concatDisplayConsole(`${j.print(x)}`)
                break
            case "string":
                if (x.length != 1) {
                    j.pushError('primitive put', 'number, boolean or single character string needed for put');
                    return
                }
                j.concatDisplayConsole(`${x}`);
                break
            default:
                j.pushError('primitive put', 'number, boolean or single character string needed for put');
                return
        }
        if (j.editor.Cursor().type !== "Nil") {
            j.editor.DeletePrev(false, false)
            j.editor.DeletePrev(false, false)
            $(document).focus(); // Prompts and alerts steal focus
            update();
        }
    });

    j.primitive('putch', (x: any) => {
        switch (typeof (x)) {
            case "number":
                let s = String.fromCharCode(x)
                j.concatDisplayConsole(j.print(s))
                break
            case "string":
                if (x.length != 1) {
                    j.pushError('primitive putch', 'number, boolean or single character string needed for put');
                    return
                }
                j.concatDisplayConsole(x)
                break
            default:
                j.pushError('primitive putch', 'number, boolean or single character string needed for put');
        }
        if (j.editor.Cursor().type !== "Nil") {
            j.editor.DeletePrev(false, false)
            j.editor.DeletePrev(false, false)
            $(document).focus(); // Prompts and alerts steal focus
            update();
        }
    });

    // combinators
    j.primitive('dip', (x: any, q: any) => {
        j.run(q);
        j.pushStack(x);
    });

    // arithmetic
    j.primitive('+', (y: any, x: number) => { return evalNumeric('+', y, x) });
    j.primitive('-', (y: any, x: number) => { return evalNumeric('-', y, x) });
    j.primitive('*', (y: any, x: number) => { return evalNumeric('*', y, x) });
    j.primitive('/', (y: any, x: number) => { return evalNumeric('/', y, x) });

    j.primitive('rem', (y: number, x: number) => {
        const _x = isLiteral(x) ? getLiteral(x) : x
        const _y = isLiteral(y) ? getLiteral(y) : y
        if (!is2Numbers(_x, _y)) {
            j.pushError('primitive rem', "operands for 'rem' must be numbers");
            return;
        }

        j.pushStack(_y % _x);
    });

    // comparison
    j.primitive('=', (y: any, x: any) => { return evalLogical('=', y, x) });
    j.primitive('<', (y: any, x: any) => { return evalLogical('<', y, x) });
    j.primitive('>', (y: any, x: any) => { return evalLogical('>', y, x) });
    j.primitive('<=', (y: any, x: any) => { return evalLogical('<=', y, x) });
    j.primitive('>=', (y: any, x: any) => { return evalLogical('>=', y, x) });
    j.primitive('numerical', (x: any) => { return typeof x === 'number' })
    j.primitive('null', (x: any) => {
        switch (typeof x) {
            case 'number':
                return x == 0
            case 'object':
                if (x.kind == 'list') {
                    return x.length == 0
                }
                return false
            case 'string':
                return x == ''
            default:
                return false
        }
    })

    // boolean/conditional
    j.primitive('true', () => { return true });
    j.primitive('false', () => { return false });

    // need type checks for not, and, or, xor
    j.primitive('not', (x: any) => { j.pushStack(!x) });
    j.primitive('and', (y: any, x: any) => { j.pushStack(y && x) });
    j.primitive('or', (y: any, x: any) => { j.pushStack(y || x) });
    j.primitive('xor', (y: any, x: any) => { j.pushStack((y || x) && !(y && x)) });

    j.primitive('list', (x: any) => { j.pushStack(typeof x === 'object' && x.kind === 'list') });
    j.primitive('numerical', (x: any) => {
        const _x = isLiteral(x) ? getLiteral(x) : x
        j.pushStack(typeof _x === 'number')
    });
    j.primitive('ifte', (x: any, p: any, q: any) => {
        const oldStack = copyStack()
        // j.execute('stack')
        // let oldStackList: any = j.popStack()
        j.run(x)
        const predicate = j.popStack()
        // j.pushStack(oldStackList)
        j.setStack(oldStack)
        // j.execute('unstack')
        j.run(predicate ? p : q)
        let result = j.popStack()
        return result
    });

    // lists
    j.primitive('cons', (x: any, xs: any) => {
        switch (typeof xs) {
            case 'string':
                if (!(typeof x === 'string' && x.length === 1)) {
                    j.pushError('primitive cons', "first argument for 'cons' string must be a single character")
                    return xs
                }
                return x + xs
            case 'object':
                if (xs.kind !== 'list') {
                    j.pushError('primitive cons', "second argument for 'cons' must be a list/quotation");
                    return xs;
                }
                if (typeof x == 'number' || typeof x == 'boolean' || typeof x == 'string') {
                    const _xs1: any = [{ kind: 'literal', disp: x.toString(), val: x }, ...xs]
                    _xs1.kind = 'list'
                    return _xs1;
                } else {
                    // const _x: any = jCopy(x)
                    const _xs2: any = [jCopy(x), ...xs]
                    _xs2.kind = 'list'
                    return _xs2;
                }
            default:
                j.pushError('primitive cons', "unknown type for second argument");
                return xs;
        }
    });

    j.primitive('snoc', (xs: any) => {
        switch (typeof xs) {
            case 'string':
                if (xs.length < 1) {
                    j.pushError('primitive snoc', "argument for 'snoc' must be a non-empty string");
                    return
                }
                j.pushStack(xs[0]);
                return xs.slice(1);
            case 'object':
                if (!(xs.kind === 'list' && xs.length > 0)) {
                    j.pushError('primitive snoc', "argument for 'snoc' must be a non-empty list or quotation");
                    return
                }
                const x = jCopy(xs[0]);
                j.pushStack(x);
                const _xs = xs.slice(1)
                _xs.kind = 'list'
                return _xs;
            default:
                j.pushError('primitive snoc', "argument for 'snoc' must be a non-empty list, quotation or string");
                return
        }
    });

    j.primitive('concat', (xs: any, ys: any) => {
        if (isLiteral(xs)) xs = getLiteral(xs)
        if (isLiteral(ys)) ys = getLiteral(ys)

        if (typeof xs !== typeof ys) {
            j.pushError('primitive concat', "arguments for 'concat' must be the same type");
            return
        }
        if (typeof xs === 'string' && typeof ys === 'string') {
            return xs.concat(ys);
        }
        if (xs.kind !== 'list' || ys.kind !== 'list') {
            j.pushError('primitive concat', "arguments for 'concat' must be a lists and/or quotations");
            return
        }

        const _xs: any = xs.concat(ys)
        _xs.kind = 'list'
        return _xs
    });

    j.primitive('range', (y: number, x: number) => {
        const r: any = [];
        r.kind = 'list';
        for (let i = x; i <= y; i += 1) {
            r.push({ kind: 'literal', disp: i.toString(), val: i });
        }
        j.pushStack(r);
    });

    j.primitive('step', (xs: any, q: any) => {
        if (q === undefined || typeof q !== 'object' || q.kind !== 'list') {
            j.pushError('primitive step', "second argument of 'step' must be a quotation")
            return
        }
        const xsCopy = jCopy(xs)
        switch (typeof xs) {
            case 'string':
                for (let i = 0; i < xs.length; i += 1) {
                    j.pushStack(xs[i])
                    let _q = jCopy(q)
                    j.run(_q)
                }
                break
            case 'object':
                if (xs.kind === 'list') {
                    for (let i = 0; i < xs.length; i += 1) {
                        j.pushStack(xsCopy[i])
                        let _q = jCopy(q)
                        j.run(_q)
                    }
                }
                break;
            default:
                j.pushError('primitive step', "first argument of 'map' must be a string or list/quotation")
        }
    });

    j.primitive('map', (xs: any, q: any) => {
        switch (typeof xs) {
            case 'string':
                let ys = ''
                for (let i = 0; i < xs.length; i += 1) {
                    j.pushStack(xs[i])
                    let _q = jCopy(q)
                    j.run(_q)
                    ys += j.popStack()
                }
                return ys
            case 'object':
                let _xs: any = []
                _xs.kind = 'list'
                if (xs.kind === 'list') {
                    for (let i = 0; i < xs.length; i += 1) {
                        j.pushStack(jCopy(xs[i]))
                        let _q = jCopy(q)
                        j.run(_q)
                        j.assertStack('primitive map', 1)
                        _xs.push(j.popStack())
                    }
                    return _xs
                }
                break;
            default:
                j.pushError('primitive map', "first argument of 'map' must be a string or list/quotation")
        }
    });

    j.primitive('filter', (xs: any, q: any) => {
        let ys = '';
        switch (typeof xs) {
            case 'string':
                for (let i = 0; i < xs.length; i += 1) {
                    j.pushStack(xs[i])
                    let _q = jCopy(q)
                    j.run(_q)
                    if (j.popStack()) {
                        ys += xs[i]
                    }
                }
                return ys;
            case 'object':
                if (xs.kind === 'list') {
                    const f: any = []
                    f.kind = 'list'
                    for (let i = 0; i < xs.length; i += 1) {
                        const x = jCopy(xs[i])
                        // const _x = typeof x == 'function' ? x.disp : x 
                        j.pushStack(x)
                        let _q = jCopy(q)
                        j.run(_q)
                        if (j.popStack()) {
                            f.push(x)
                        }
                    }
                    return f
                }
                break;
            default:
                j.pushError('primitive filter', "first argument of 'filter' must be a string or list/quotation");
        }
    });

    j.primitive('fold', (xs: any, a: any, q: any) => {
        switch (typeof xs) {
            case 'string':
                j.pushStack(a);
                for (let i = 0; i < xs.length; i += 1) {
                    j.pushStack(xs[i]);
                    let _q = jCopy(q)
                    j.run(_q)
                }
                return j.popStack();
            case 'object':
                if (xs.kind === 'list') {
                    j.pushStack(a);
                    for (let i = 0; i < xs.length; i += 1) {
                        j.pushStack(jCopy(xs[i]));
                        let _q = jCopy(q)
                        j.run(_q)
                    }
                    return j.popStack();
                }
                break;
            default:
                j.pushError('primitive fold', "first argument of 'fold' must be a string or list/quotation");
        }
    });

    // convenience, not displayed as a true primitives
    j.primitive('libload', (s: string) => {
        // do nothing, libraries loaded through extension
    });

    j.primitive('.', (x: any) => {
        // empty display console to results first
        j.concatResult(j.getDisplayConsole())
        j.clearDisplayConsole()

        if (x !== undefined) {
            let output = j.print(x);
            if (typeof (x) === "object" && x.kind === 'list') {
                output = `[ ${output}]`;
            }
            output = `${output}<br />`
            j.concatResult(output)
        }
        if (j.editor.Cursor().type !== "Nil") {
            j.editor.DeletePrev(false, false)
            j.editor.DeletePrev(false, false)
            $(document).focus(); // Prompts and alerts steal focus
            update();
        }
    });

    j.primitive('primitives', () => {
        const primitives: any = [];
        primitives.kind = 'list';

        j.words().forEach(key => {
            const func = j.word(key);
            const kind = func.kind;
            const excluded = key === 'primitives' || key === 'library' ||
                key === 'aaa' || key === '.' || key === 'libload'
            if (kind === 'primitive' && !excluded) {
                primitives.push(func);
            }
        });

        primitives.sort((a: any, b: any) => {
            if (a.disp > b.disp) return 1;
            if (a.disp < b.disp) return -1;
            return 0;
        });
        return primitives;
    });

    j.primitive('library', () => {
        const libray: any = [];
        libray.kind = 'list';

        j.words().forEach(key => {
            const func = j.word(key);
            if (func.kind === 'secondary') {
                libray.push(func);
            }
        });

        libray.sort((a: any, b: any) => {
            if (a.disp > b.disp) return 1;
            if (a.disp < b.disp) return -1;
            return 0;
        });
        return libray;
    });

    // utility function
    function is2Numbers(x: any, y: any) {
        return typeof x === 'number' && typeof y === 'number';
    }

    // const deepCopy = ((obj: any) => JSON.parse(JSON.stringify(obj)))
    // const jsonEqual = ((a: any, b: any) => JSON.stringify(a) === JSON.stringify(b))

    const isLiteral = ((obj: any) => {
        switch (typeof obj) {
            case 'string':
            case 'number':
            case 'boolean':
                return true
            case 'object':
                if (obj.kind === 'literal') {
                    return true
                }
                return false
            default:
                return false
        }
    })

    const getLiteral = ((obj: any) => {
        if (typeof obj === 'object') {
            return obj.val
        }
        return obj
    })

    const typesMatch = ((y: any, x: any) => {
        return typeof y === typeof x
    })

    const evalLogical = ((op: string, y: any, x: any) => {
        if (op == '=' && typeof y == 'function' && typeof x == 'function') {
            return y.disp == x.disp
        }

        if (!isLiteral(y) || !isLiteral(x)) {
            j.pushError('function evalLogical', "must be a literal for " + op);
            return
        }

        let _y = getLiteral(y)
        let _x = getLiteral(x)
        if (!typesMatch(_y, _x)) {
            j.pushError('function evalLogical', "types must be the same " + op);
            return
        }

        let result = false;
        switch (op) {
            case '=':
                result = _y == _x
                break
            case '>':
                result = _y > _x
                break
            case '>=':
                result = _y >= _x
                break
            case '<':
                result = _y < _x
                break
            case '<+':
                result = _y <= _x
                break
            default:
                j.pushError('function evalLogical', "invalid logical operator " + op);
                return
        }
        return result
    })

    const evalNumeric = ((op: string, y: any, x: any) => {
        if (!isLiteral(y) && !isLiteral(x)) {
            j.pushError('function evalNumeric', "types not valid for " + op);
            return
        }

        let _y = getLiteral(y)
        let _x = getLiteral(x)

        switch (op) {
            case '+':
                if (typeof _y === 'string' && _y.length === 1 && typeof _x === 'number') {
                    return String.fromCharCode(_y.charCodeAt(0) + _x)
                }
                return _y + _x
            case '-':
                if (typeof _y === 'string' && _y.length === 1 && typeof _x === 'number') {
                    return String.fromCharCode(_y.charCodeAt(0) - _x)
                }
                return _y - _x
            case '*':
                return _y * _x
            case '/':
                if (_x == 0) {
                    j.pushError('function evalNumeric', "cannot divide by 0 " + op);
                    return
                }
                return _y / _x
            default:
                j.pushError('function evalNumeric', "invalid logical operator " + op);
                return
        }
    })


    const copyStack = (() => {
        return jCopy(j.getStack())
    })

    const replaceStack = ((stack: any) => {
        j.setStack(stack)
    })



} // initialJoyPrimitives