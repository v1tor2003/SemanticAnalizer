"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tk_number_regex = exports.tk_string_literal_regex = exports.tk_block_regex = exports.tk_id_regex = exports.KEYWORDS = void 0;
// Palavras chaves da linguagem
exports.KEYWORDS = {
    openBlock: "BLOCO",
    closeBlock: "FIM",
    printToken: "PRINT"
};
// Regex para identificar o id
exports.tk_id_regex = /^[a-z][a-z0-9_]*$/;
// Regex para identificar o nome de bloco
exports.tk_block_regex = /^_[a-zA-Z0-9]+_$/;
// Regex para identificar a cadeia
exports.tk_string_literal_regex = /^".*"$/;
// Regex para identificar o numero
exports.tk_number_regex = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;
