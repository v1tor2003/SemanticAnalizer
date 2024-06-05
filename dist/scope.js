"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scope = void 0;
const definitions_1 = require("./definitions");
class Scope {
    scopeName;
    parentScope;
    symbols = {};
    constructor(lineCounter, scopeName, parentScope = null) {
        this.scopeName = scopeName;
        this.parentScope = parentScope;
        if (!definitions_1.tk_block_regex.test(scopeName)) {
            console.log(`Erro linha ${lineCounter}, Nome de escopo mal formado '${scopeName}'`);
            return;
        }
        this.symbols[scopeName] = {
            kind: "tk_bloco",
            value: scopeName
        };
    }
    define(lineCounter, id, token) {
        const error = `Erro linha ${lineCounter}, `;
        if (this.symbols[id]) {
            console.log(error + `Variavel '${id}' ja existe.`);
            return;
        }
        if (!definitions_1.tk_id_regex.test(id)) {
            console.log(error + `Nome de variavel '${id}' mal formado.`);
            return;
        }
        this.symbols[id] = token;
    }
    assign(lineCounter, left, right) {
        const error = `Erro linha ${lineCounter}, `;
        if (!this.lookup(left)) {
            console.log(error + `Variavel '${left}' nao foi definida.`);
            return;
        }
        const l = this.lookup(left);
        if (right.kind !== 'tk_id') {
            if (this.lookup(left)?.type !== right.type) {
                console.log(error + `Erro tipos de dados imcompativeis para variavel '${left}'. Esperava-se um(a) ${l?.type === 'number' ? 'NUMERO' : 'CADEIA'}.`);
                return;
            }
            if (l)
                l.value = right.value;
            return;
        }
        if (!this.lookup(right.value)) {
            console.log(error + `Variavel '${right.value}' nao foi definida.`);
            return;
        }
        if (l?.type !== this.lookup(right.value)?.type) {
            console.log(error +
                `Erro tipos de dados imcompativeis para variavel '${l?.value}'. Esperava-se um(a) ${this.lookup(right.value)?.type === 'number' ? 'NUMERO' : 'CADEIA'}.`);
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
