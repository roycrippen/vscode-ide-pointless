/**
 * Miscellaneous string functions
 */

export function isWhite(c: string = ""): boolean {
    let a = c.charCodeAt(0);
    return a === 32 || (9 <= a && a <= 13);
}

export function isAlpha(char: string): boolean {
    if (char && char.length === 1) {
        let code = char.charCodeAt(0);
        if (((code >= 65) && (code <= 90)) || ((code >= 97) && (code <= 122))) {
            return true;
        }
    }
    return false;
}

export function isDigit(char: string): boolean {
    if (char && char.length === 1) {
        let code = char.charCodeAt(0);
        if ((code >= 48) && (code <= 57)) {
            return true;
        }
    }
    return false;
}

export function isOctalDigit(char: string): boolean {
    if (char && char.length === 1) {
        let code = char.charCodeAt(0);
        if ((code >= 48) && (code <= 55)) {
            return true;
        }
    }
    return false;
}

export function isHexDigit(char: string): boolean {
    if (char && char.length === 1) {
        let code = char.charCodeAt(0);
        if (((code >= 48) && (code <= 57)) ||
            ((code >= 65) && (code <= 70)) ||
            ((code >= 97) && (code <= 102))) {
            return true;
        }
    }
    return false;
}

export function isAlphaNum(char: string): boolean {
    return isAlpha(char) || isDigit(char);
}

export function capitalize(s: string): string {
    return s[0].toUpperCase() + s.slice(1);
}

export function isLower(char: string): boolean {
    if (char && char.length === 1) {
        let code = char.charCodeAt(0);
        if ((code > 96) && (code < 123))
            return true;
    }
    return false;
}

export function isUpper(char: string): boolean {
    if (char && char.length === 1) {
        let code = char.charCodeAt(0);
        if ((code > 64) && (code < 91))
            return true;
    }
    return false;
}

/** should be called with i pointing at backslash */
export function doesc(src: string, index: { i: number }): string {
    function hexval(c: string): number {
        let cCode = c.toLowerCase().charCodeAt(0);
        return cCode <= 57 ? cCode - 48 : cCode - 97 + 10;
    }
    function octval(c: string): number {
        return c.charCodeAt(0) - 48;
    }
    let dstCode: number;
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
            } else
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

export type Cmp = -1 | 0 | 1;

export function cmp(x: any, y: any): Cmp {
    if (x < y)
        return -1;
    else if (x > y)
        return 1;
    else
        return 0;
}
