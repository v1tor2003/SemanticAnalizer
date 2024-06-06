"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interpreter_1 = require("./interpreter");
/**
* Script cliente da classe Interpreter, pega o caminho do programa via argumento da linha de comandos
* @returns {Promise<void>}
* interpreta o programa, sem retorno
*/
async function main() {
    const program = process.argv.slice(2)[0];
    if (!program)
        throw new Error('Nenhum arquivo de entrada informado.');
    await new interpreter_1.Interpreter().interpret(program);
}
main()
    .then(() => { process.exit(0); })
    .catch((e) => {
    console.log(e);
    process.exit(1);
});
