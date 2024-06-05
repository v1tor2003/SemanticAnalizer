"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interpreter = void 0;
const fsPromises = require("fs/promises");
const scope_1 = require("./scope");
const definitions_1 = require("./definitions");
class Interpreter {
    static lineCounter = 0;
    globalScope = new scope_1.Scope(Interpreter.lineCounter, '_GLOBAL_');
    currScope = this.globalScope;
    constructor() { }
    exec(tokens) {
        Interpreter.lineCounter++;
        if (tokens.length === 0)
            return;
        if (tokens[0] === definitions_1.KEYWORDS.openBlock)
            this.createScope(tokens[1]);
        else if (tokens[0] === definitions_1.KEYWORDS.closeBlock)
            this.exitScope();
        else if (tokens[0] === definitions_1.KEYWORDS.printToken)
            this.print(tokens[1]);
        else
            this.process(tokens);
    }
    createScope(blockId) {
        if (this.currScope.lookup(blockId)) {
            console.log(`Erro linha ${Interpreter.lineCounter}, Escopo '${blockId}' ja foi definido.`);
            return;
        }
        this.currScope = new scope_1.Scope(Interpreter.lineCounter, blockId, this.currScope);
    }
    exitScope() {
        if (this.currScope !== this.globalScope)
            this.currScope = this.currScope.parentScope;
    }
    print(id) {
        const token = this.currScope.lookup(id);
        if (!token) {
            console.log(`Erro linha ${Interpreter.lineCounter}, Variavel '${id}' nao foi definida.`);
            return;
        }
        if (token.kind === 'tk_cadeia')
            console.log(`"${token.value}"`);
        else
            console.log(token.value);
    }
    process(tokens) {
        if (tokens[0] !== "NUMERO" && tokens[0] !== "CADEIA") {
            const atr = tokens.join(' ');
            const operands = atr.split('=');
            this.processAssign(operands[0].trim(), operands[1].trim());
        }
        else
            this.processDef(tokens);
    }
    processAssign(left, right) {
        let t;
        if (definitions_1.tk_string_literal_regex.test(right)) {
            t = {
                kind: 'tk_cadeia',
                type: 'string',
                value: right.slice(1, -1)
            };
        }
        else if (definitions_1.tk_number_regex.test(right)) {
            t = {
                kind: 'tk_numero',
                type: 'number',
                value: parseFloat(right)
            };
        }
        else
            t = { kind: 'tk_id', value: right };
        this.currScope.assign(Interpreter.lineCounter, left, t);
    }
    parseToken(type, token) {
        switch (type) {
            case "NUMERO":
                return this.parseNumberToken(token);
            case "CADEIA":
                return this.parseStringToken(token);
            default:
                console.error(`Erro linha ${Interpreter.lineCounter}, Tipo desconhecido: ${type}`);
                return;
        }
    }
    parseNumberToken(token) {
        if (definitions_1.tk_number_regex.test(token))
            return parseFloat(token);
        return this.lookupAndValidateToken(token, 'tk_numero', 'NUMERO');
    }
    parseStringToken(token) {
        if (definitions_1.tk_string_literal_regex.test(token))
            return token.slice(1, -1);
        return this.lookupAndValidateToken(token, 'tk_cadeia', 'NUMERO');
    }
    lookupAndValidateToken(token, expectedKind, typeDescription) {
        if (!definitions_1.tk_id_regex.test(token)) {
            console.error(`Erro linha ${Interpreter.lineCounter}, Erro de tipos incompativeis para constante '${token}'.`);
            return;
        }
        const foundId = this.currScope.lookup(token);
        if (!foundId) {
            console.error(`Erro linha ${Interpreter.lineCounter}, Variavel '${token}' nao foi definida.`);
            return;
        }
        if (foundId.kind !== expectedKind) {
            console.error(`Erro linha ${Interpreter.lineCounter}, Erro de tipos incompativeis para variavel '${token}'. Esperava-se um(a) ${typeDescription}.`);
            return;
        }
        return foundId.value;
    }
    processDef(tokens) {
        const type = tokens.shift();
        if (tokens.length === 0)
            return;
        if (tokens[1] === '=') {
            let v = this.parseToken(type, tokens[2]);
            if (v === undefined)
                return;
            this.currScope.define(Interpreter.lineCounter, tokens[0], {
                kind: type === "NUMERO" ? "tk_numero" : "tk_cadeia",
                type: type === "NUMERO" ? "number" : "string",
                value: v
            });
            tokens.splice(0, 3);
        }
        else {
            this.currScope.define(Interpreter.lineCounter, tokens[0], {
                kind: type === "NUMERO" ? 'tk_numero' : 'tk_cadeia',
                type: type === "NUMERO" ? 'number' : 'string',
                value: type === "NUMERO" ? 0 : '',
            });
            tokens.splice(0, 1);
        }
        if (tokens.length > 0) {
            tokens.unshift(type);
            return this.process(tokens);
        }
    }
    async interpret(program) {
        for await (const line of await this.readFile(program)) {
            const parsedLine = this.splitLine(line);
            this.exec(parsedLine);
        }
    }
    splitLine(line) {
        line = line.trim();
        if (line.startsWith('NUMERO') || line.startsWith('CADEIA')) {
            const type = line.split(' ')[0];
            const rest = line.substring(type.length).trim();
            const parts = rest.split(/[, ]+/).map(part => part.trim());
            const finalArray = [type];
            let inQuotes = false;
            let quotedString = '';
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (part.includes('=')) {
                    const [key, value] = part.split('=').map(p => p.trim());
                    if (value.startsWith('"') && value.endsWith('"'))
                        finalArray.push(key, '=', value);
                    else if (value.startsWith('"')) {
                        inQuotes = true;
                        quotedString = value;
                        finalArray.push(key, '=');
                    }
                    else
                        finalArray.push(key, '=', value);
                }
                else if (inQuotes) {
                    quotedString += ' ' + part;
                    if (part.endsWith('"')) {
                        finalArray.push(quotedString);
                        inQuotes = false;
                        quotedString = '';
                    }
                }
                else
                    finalArray.push(part);
            }
            return finalArray.filter(e => e !== '');
        }
        else if (Object.values(definitions_1.KEYWORDS).includes(line.substring(0, line.indexOf(' '))))
            return line.split(' ').map(part => part.trim());
        else {
            const parts = line.split('=').map(part => part.trim());
            if (parts.length === 2)
                return [parts[0], '=', parts[1]];
        }
        return [];
    }
    /**
     * Funcao realiza a leitura do arquivo de entrada .txt.
     * @param {string} path caminho do arquivo
     * @returns {Promise<AsyncIterable<string>>}
     * a funcao retorna um objeto contendo as linhas
    */
    async readFile(path) {
        try {
            return (await fsPromises.open(path, 'r')).readLines();
        }
        catch (error) {
            throw new Error('Erro ao abrir arquivo: ' + error);
        }
    }
}
exports.Interpreter = Interpreter;
