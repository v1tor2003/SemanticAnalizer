"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tk_number_regex = exports.tk_string_literal_regex = exports.tk_block_regex = exports.tk_id_regex = exports.KEYWORDS = void 0;
exports.KEYWORDS = {
    openBlock: "BLOCO",
    closeBlock: "FIM",
    printToken: "PRINT"
};
exports.tk_id_regex = /^[a-z][a-z0-9_]*$/;
exports.tk_block_regex = /^_[a-zA-Z0-9]+_$/;
exports.tk_string_literal_regex = /^".*"$/;
exports.tk_number_regex = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;
