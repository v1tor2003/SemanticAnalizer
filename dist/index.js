"use strict";
// tokenize the stream of input
// create and manage the table of simbols
// Symbol: [token, lexeme, dataType, value]
// report errors log to the console when
//    - Invalide types
//    - undefined variables
Object.defineProperty(exports, "__esModule", { value: true });
const interpreter_1 = require("./interpreter");
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
