/**
 * Token values for Lexer
 */

export enum Token {
    EOF,
    WHITESPACE,
    DOT,
    COLON,
    SEMICOLON,
    SINGLE_QUOTE,
    L_BRACKET,
    R_BRACKET,
    L_CURLY,
    R_CURLY,
    LIBRA,
    DEFINE,
    COMMENT,
    STRING,
    QUOTED_STRING,
    NEWLINE,
    ERROR,
    EQEQ,
    IDENTIFIER,
    GT,
    GTEQ,
    LT,
    LTEQ,
    EQ,
    UNKNOWN
}

export interface StrToTok {
    [key: string]: Token;
}

export const keywords: StrToTok = {
    "LIBRA": Token.LIBRA,
    "DEFINE": Token.DEFINE,
    "GT": Token.GT,
    "GTEQ": Token.GTEQ,
    "LT": Token.LT,
    "LTEQ": Token.LTEQ,
};

export interface TokToStr {
    [key: string]: string;
}

export const tokToStr: TokToStr = {
    LIBRA: "LIBRA",
    DEFINE: "DEFINE",
    EQEQ: "==",
    L_BRACKET: "[",
    R_BRACKET: "]",
    SEMICOLON: ";",
    DOT: ".",
    GT: ">",
    GTEQ: ">=",
    LT: "<",
    LTEQ: "<=",
    EQ: "=",
}