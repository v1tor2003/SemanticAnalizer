"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scope = void 0;
class Scope {
    scopeName;
    parentScope;
    symbols = {};
    static tk_id_regex = /^[a-z][a-z0-9_]*$/;
    static tk_block_regex = /^_[a-zA-Z0-9]+_$/;
    constructor(scopeName, parentScope = null) {
        this.scopeName = scopeName;
        this.parentScope = parentScope;
        try {
            if (!Scope.tk_block_regex.test(scopeName))
                throw new Error();
            this.symbols[scopeName] = {
                kind: "tk_bloco",
                value: scopeName
            };
        }
        catch (error) {
            console.log(`Nome de escopo mal formado '${scopeName}'`);
        }
    }
    define(lineCounter, id, token) {
        const error = `Erro linha ${lineCounter}, `;
        if (this.symbols[id]) {
            console.log(error + `Variavel '${id}' ja existe.`);
            return;
        }
        if (!Scope.tk_id_regex.test(id)) {
            console.log(error + `Nome de variavel '${id}' mal formado.`);
            return;
        }
        this.symbols[id] = token;
    }
    assign(lineCounter, left, right) {
        const error = `Erro linha ${lineCounter}, `;
        if (!this.lookup(left)) {
            console.log(error + `Variavel '${left}' nao existe.`);
            return;
        }
        const l = this.lookup(left);
        if (right.kind !== 'tk_id') {
            if (this.lookup(left)?.type !== right.type) {
                console.log(error + `Erro tipo de dado nao compativeis ${l?.type}: [${left}] e ${right.type} [${right.value}].`);
                return;
            }
            //may be lookyp
            if (l)
                l.value = right.value;
            return;
        }
        if (!this.lookup(right.value)) {
            console.log(error + `Variavel '${right.value}' nao existe.`);
            return;
        }
        if (l?.type !== this.lookup(right.value)?.type) {
            console.log(error +
                `Erro tipo de dado nao compativeis ${l?.type}: [${l?.value}] e ${this.lookup(right.value)?.type}: [${this.lookup(right.value)?.value}].`);
            return;
        }
        if (l)
            l.value = this.lookup(right.value)?.value;
    }
    lookup(id) {
        if (this.symbols[id])
            return this.symbols[id];
        else if (this.parentScope)
            return this.parentScope.lookup(id);
    }
}
exports.Scope = Scope;
