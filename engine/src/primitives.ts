import { Joy } from "./engine"
import { update } from "./editor"

// load joy primitives into and instance of the engine
export function loadJoyPrimitives(j: Joy) {

    // used for testing new code
    j.primitive('aaa', () => {
        let source = "";

        j.processJoySource(source);

    });

    // language
    j.primitive('define', (quote: any, name: string) => { j.define(quote, name); });

    // stack
    j.primitive('pop', () => { j.popStack(); });

    j.primitive('dup', (x: any) => {
        const ret: any = [x, x];
        ret.kind = 'tuple';
        return ret;
    });

    j.primitive('swap', (y: any, x: any) => {
        const ret: any = [x, y];
        ret.kind = 'tuple';
        return ret;
    });

    // stdout/stdin
    j.primitive('put', (x: any) => {
        switch (typeof (x)) {
            case "number":
            case "boolean":
                j.concatDisplayConsole(`${j.print(x)} `)
                break
            case "string":
                if (x.length != 1) {
                    j.pushError('number, boolean or single character string needed for put');
                    return
                }
                j.concatDisplayConsole(`${x} `);
                break
            default:
                j.pushError('number, boolean or single character string needed for put');
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
                    j.pushError('number, boolean or single character string needed for put');
                    return
                }
                j.concatDisplayConsole(x)
                break
            default:
                j.pushError('number, boolean or single character string needed for put');
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
    j.primitive('numerical', (x: any) => { return typeof x === 'number' })

    j.primitive('+', (y: any, x: number) => {
        if (typeof y === 'string' && y.length === 1 && typeof x === 'number') {
            return String.fromCharCode(y.charCodeAt(0) + x);
        }
        if (!is2Numbers(x, y)) {
            j.pushError("opperands for '+' must be numbers");
            return 0;
        }
        return y + x;
    });

    j.primitive('-', (y: any, x: number) => {
        if (typeof y === 'string' && y.length === 1 && typeof x === 'number') {
            return String.fromCharCode(y.charCodeAt(0) - x);
        }
        if (!is2Numbers(x, y)) {
            j.pushError("opperands for '-' must be numbers");
            return 0;
        }
        return y - x;
    });

    j.primitive('*', (y: number, x: number) => {
        if (!is2Numbers(x, y)) {
            j.pushError("operands for '*' must be numbers");
            return 0;
        }
        return y * x;
    });

    j.primitive('/', (y: number, x: number) => {
        if (!is2Numbers(x, y)) {
            j.pushError("operands for '/' must be numbers");
            return 0;
        }
        if (x === 0) {
            j.pushError("divisor for '/' must not be 0");
            return 0;
        }
        return y / x;
    });

    j.primitive('rem', (y: number, x: number) => {
        if (!is2Numbers(x, y)) {
            j.pushError("operands for 'rem' must be numbers");
            return;
        }
        j.pushStack(y % x);
    });

    // comparison
    j.primitive('=', (y: any, x: any) => { j.pushStack(y === x) });
    j.primitive('<', (y: any, x: any) => { j.pushStack(y < x) });
    j.primitive('>', (y: any, x: any) => { j.pushStack(y > x) });
    j.primitive('<=', (y: any, x: any) => { j.pushStack(y <= x) });
    j.primitive('>=', (y: any, x: any) => { j.pushStack(y >= x) });

    // boolean/conditional
    j.primitive('true', () => { j.pushStack(true) });
    j.primitive('false', () => { j.pushStack(false) });
    j.primitive('not', (x: any) => { j.pushStack(!x) });
    j.primitive('and', (y: any, x: any) => { j.pushStack(y && x) });
    j.primitive('or', (y: any, x: any) => { j.pushStack(y || x) });
    j.primitive('xor', (y: any, x: any) => { j.pushStack((y || x) && !(y && x)) });
    j.primitive('list', (x: any) => { j.pushStack(typeof x === 'object' && x.kind === 'list') });
    j.primitive('numerical', (x: any) => { j.pushStack(typeof x === 'number') });
    j.primitive('ifte', (x: any, p: any, q: any) => {
        j.execute('dup')
        j.run(x)
        const predicate = j.popStack()
        j.run(predicate ? p : q)
    });

    // lists
    j.primitive('size', (x: any) => {
        x.length
    });

    j.primitive('cons', (x: any, xs: any) => {
        if (typeof x === 'string' && x.length === 1 && typeof xs === 'string') {
            return x + xs;
        }
        if ((typeof x === 'object' && x.kind !== 'list') || !(typeof xs === 'object' && xs.kind === 'list')) {
            j.pushError("arguments for 'cons' must be a literal followed by a list/quotation");
            return xs;
        }
        xs.unshift({ val: x, kind: 'literal', disp: x.toString() });
        return xs;
    });

    j.primitive('snoc', (xs: any) => {
        if (typeof xs === 'string' && xs.length > 0) {
            j.pushStack(xs[0]);
            return xs.slice(1);
        }
        if (!(typeof xs === 'object' && xs.kind === 'list')) {
            j.pushError("argument for 'snoc' must be a non-empty list/quotation/string");
            return xs;
        }
        const x = xs.shift();
        j.pushStack(x.val);
        return xs;
    });

    j.primitive('concat', (xs: any, ys: any) => {
        if (typeof xs !== typeof ys) {
            j.pushError("arguments for 'concat' must be the same type");
            return xs;
        }
        if (typeof xs === 'string' && typeof ys === 'string') {
            return xs.concat(ys);
        }
        if (xs.kind !== 'list' || ys.kind !== 'list') {
            j.pushError("arguments for 'concat' must be a lists and/or quotations");
            return xs;
        }
        for (let i = 0; i < ys.length; i += 1) {
            xs.push(ys[i]);
        }
        return xs;
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
        if (q === undefined) {
            j.pushError("second argument of 'step' must be a quotation")
            return
        }
        const xsCopy = xs
        switch (typeof xs) {
            case 'string':
                for (let i = 0; i < xs.length; i += 1) {
                    j.pushStack(xs[i])
                    j.run(q)
                }
                break
            case 'object':
                if (xs.kind === 'list') {
                    for (let i = 0; i < xs.length; i += 1) {
                        j.pushStack(xsCopy[i].val)
                        j.run(q)
                    }
                }
                break;
            default:
                j.pushError("first argument of 'map' must be a string or list/quotation")
        }
    });

    j.primitive('map', (xs: any, q: any) => {
        let ys = ''
        const xsCopy = xs
        switch (typeof xs) {
            case 'string':
                for (let i = 0; i < xs.length; i += 1) {
                    j.pushStack(xs[i])
                    j.run(q)
                    j.assertStack(1)
                    const v = j.popStack()
                    ys += v
                }
                j.pushStack(ys)
                break
            case 'object':
                if (xs.kind === 'list') {
                    for (let i = 0; i < xs.length; i += 1) {
                        j.pushStack(xsCopy[i].val)
                        j.run(q)
                        j.assertStack(1)
                        const v = j.popStack()
                        xsCopy[i].val = v
                        xsCopy[i].disp = v.toString()
                    }
                    j.pushStack(xs)
                }
                break;
            default:
                j.pushError("first argument of 'map' must be a string or list/quotation")
        }
    });

    j.primitive('filter', (xs: any, q: any) => {
        let ys = '';
        switch (typeof xs) {
            case 'string':
                for (let i = 0; i < xs.length; i += 1) {
                    j.pushStack(xs[i]);
                    j.run(q);
                    if (j.popStack()) ys += xs[i];
                }
                j.pushStack(ys);
                break;
            case 'object':
                if (xs.kind === 'list') {
                    const f: any = [];
                    f.kind = 'list';
                    for (let i = 0; i < xs.length; i += 1) {
                        const x = xs[i];
                        j.pushStack(x.val);
                        j.run(q);
                        if (j.popStack()) f.push(x);
                    }
                    j.pushStack(f);
                }
                break;
            default:
                j.pushError("first argument of 'filter' must be a string or list/quotation");
        }
    });

    j.primitive('fold', (xs: any, b: any, q: any) => {
        let a = b;
        switch (typeof xs) {
            case 'string':
                for (let i = 0; i < xs.length; i += 1) {
                    j.pushStack(a);
                    j.pushStack(xs[i]);
                    j.run(q);
                    j.assertStack(1)
                    a = j.popStack();
                }
                j.pushStack(a);
                break;
            case 'object':
                if (xs.kind === 'list') {
                    for (let i = 0; i < xs.length; i += 1) {
                        j.pushStack(a);
                        j.pushStack(xs[i].val);
                        j.run(q);
                        j.assertStack(1)
                        a = j.popStack();
                    }
                    j.pushStack(a);
                }
                break;
            default:
                j.pushError("first argument of 'fold' must be a string or list/quotation");
        }
    });

    // convenience, not displayed a true primitives
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

} // initialJoyprimitives