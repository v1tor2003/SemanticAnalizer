// tokenize the stream of input
// create and manage the table of simbols
// Symbol: [token, lexeme, dataType, value]
// report errors log to the console when
//    - Invalide types
//    - undefined variables

import { Interpreter } from "./interpreter"

async function main(): Promise<void>{
  const program: string = process.argv.slice(2)[0]
  if(!program) throw new Error('Nenhum arquivo de entrada informado.')

  await new Interpreter().interpret(program)
}

main()
  .then(() => {process.exit(0)})
  .catch((e: unknown) => {
    console.log(e)
    process.exit(1)
  })