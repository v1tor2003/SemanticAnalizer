import { Interpreter } from "./interpreter"
/**
* Script cliente da classe Interpreter, pega o caminho do programa via argumento da linha de comandos
* @returns {Promise<void>} 
* interpreta o programa, sem retorno
*/
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