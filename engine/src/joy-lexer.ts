import { Token, tokToStr } from "./tokens"
import { Lexer } from "./lexer"

export function lexJoyCommands(src: string): Tokens[] {
    let toks: Tokens[] = [];
    let lexer = new Lexer(src);
    let i = 0;
    while (true) {
        let token = lexer.next();
        if (token === Token.EOF)
            break;
        if (token === Token.WHITESPACE || token === Token.NEWLINE || token === Token.COMMENT)
            continue;
        let value: string = "";
        if (token === Token.STRING || token === Token.QUOTED_STRING) {
            value = lexer.value();
        } else {
            value = tokToStr[Token[token]];
        }
        toks.push({ token: token, value: value });
        i++;
    }
    return toks;
}

export interface Tokens {
    token: Token
    value: any
}

