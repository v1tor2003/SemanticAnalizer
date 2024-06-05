import * as fsPromises from 'fs/promises'
import { Scope, Token } from "./scope"
import { Lexeme } from "./scope"

const KEYWORDS = {
  openBlock: "BLOCO",
  closeBlock: "FIM",
  printToken: "PRINT"
}

export class Interpreter {
  private globalScope = new Scope('_GLOBAL_')
  private currScope = this.globalScope
  private static lineCounter: number = 0
  constructor(){}
  
  private exec(tokens: string[]): void{
    Interpreter.lineCounter++
    if(tokens.length === 0) return
                               
    if(tokens[0] === KEYWORDS.openBlock) this.createScope(tokens[1])
    else if(tokens[0] === KEYWORDS.closeBlock) this.exitScope()
    else if(tokens[0] === KEYWORDS.printToken) this.print(tokens[1])
    else this.process(tokens)
  }

  private createScope(blockId: string): void{ 
    if(this.currScope.lookup(blockId)) {
      console.log(`Erro linha ${Interpreter.lineCounter}, Escopo '${blockId}' ja foi definido.`)
      return
    }
    
    this.currScope = new Scope(blockId, this.currScope)
  }

  private exitScope(){ 
    if(this.currScope !== this.globalScope) this.currScope = this.currScope.parentScope!
  }

  private print(id: string): void{
    const token = this.currScope.lookup(id)
    if(!token){
      console.log(`Erro linha ${Interpreter.lineCounter}, Variavel '${id}' nao foi definida.`)
      return
    } 
    if(token.kind === 'tk_cadeia')
      console.log(`"${token.value}"`)
    else console.log(token.value)
  }

  private process(tokens: string[]): void {
    // Assign variables
    if(tokens[0] !== "NUMERO" && tokens[0] !== "CADEIA"){
      const atr: string = tokens.join(' ')
      const operands: string[] = atr.split('=')
      this.processAssign(operands[0].trim(), operands[1].trim())
    }else{
      // Define variables
      this.processDef(tokens)
    }
  }

  private processAssign(left: string, right: string): void{
    let t: Token
    if(right.startsWith('\"')){
      t = {
        kind: 'tk_cadeia',
        type: 'string',
        value: right.slice(1, -1)
      }
    }else if(parseFloat(right)){
      t = {
        kind: 'tk_numero',
        type: 'number',
        value: parseFloat(right)
      }
    }else t = { kind: 'tk_id', value: right}

    this.currScope.assign(Interpreter.lineCounter, left, t)
  }

  private processDef(tokens: string[]): void{
    const type = tokens.shift()
    if (tokens.length === 0) return
    if (tokens[1] === '=') {
        let v: Lexeme | undefined

        if (type === "NUMERO")
            v = parseFloat(tokens[2]) || this.currScope.lookup(tokens[2])?.value
        else
            v = tokens[2].startsWith('\"') ? tokens[2].slice(1, -1) : this.currScope.lookup(tokens[2])?.value

        if (!v) console.log(`Variável '${tokens[2]} não existe.'`)

        this.currScope.define(
          Interpreter.lineCounter,
          tokens[0], 
          {
            kind: type === "NUMERO" ? "tk_numero" : "tk_cadeia",
            type: type === "NUMERO" ? "number" : "string",
            value: v
          }
        )

        tokens.splice(0, 3)
    } else {
        this.currScope.define(
          Interpreter.lineCounter,
          tokens[0], 
          {
            kind: type === "NUMERO" ? 'tk_numero' : 'tk_cadeia',
            type: type === "NUMERO" ? 'number' : 'string',
            value: type === "NUMERO" ? 0 : '',
          }
        )

        tokens.splice(0, 1)
    }

    if (tokens.length > 0) {
        tokens.unshift(type as string)
        return this.process(tokens)
    }
  }

  public async interpret(program: string): Promise<void>{
    for await(const line of await this.readFile(program)){
      const parsedLine = this.splitLine(line)
      this.exec(parsedLine)
    }
  }

  private splitLine(line: string): string[] {
    line = line.trim()
    
    if (line.startsWith('NUMERO') || line.startsWith('CADEIA')) {
        const type = line.split(' ')[0]
        const rest = line.substring(type.length).trim()
        const parts = rest.split(/[, ]+/).map(part => part.trim())
        
        const finalArray = [type]
        
        for (let i = 0; i < parts.length; i++) {
            if (parts[i].includes('=')) {
                const [key, value] = parts[i].split('=').map(part => part.trim())
                finalArray.push(key, '=', value)
            } else finalArray.push(parts[i])
        }

        return finalArray.filter(e => e !== '')
    } else if(Object.values(KEYWORDS).includes(line.substring(0, line.indexOf(' ')))) 
      return line.split(' ').map(part => part.trim())
    else {
        const parts = line.split('=').map(part => part.trim())
        if (parts.length === 2) return [parts[0], '=', parts[1]]
    }
    
    return []
  }

  /**
   * Funcao realiza a leitura do arquivo de entrada .txt.
   * @param {string} path caminho do arquivo
   * @returns {Promise<AsyncIterable<string>>} 
   * a funcao retorna um objeto contendo as linhas
  */
  private async readFile(path: string): Promise<AsyncIterable<string>> {
    try { return (await fsPromises.open(path, 'r')).readLines() } 
    catch (error: unknown) {
      throw new Error('Erro ao abrir arquivo: ' + error)
    }
  }
}