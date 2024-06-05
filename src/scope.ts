import { 
  DataType,
  Kind,
  Lexeme,
  SymbolTable, 
  Token, 
  tk_block_regex, 
  tk_id_regex } 
from "./definitions"

export class Scope {
  public symbols: SymbolTable = {}
  

  constructor(
    lineCounter: number,
    private scopeName: string,
    public parentScope: Scope | null = null
  ){
    if(!tk_block_regex.test(scopeName)) {
      console.log(`Erro linha ${lineCounter}, Nome de escopo mal formado '${scopeName}'`)
      return 
    }
    this.symbols[scopeName] = {
      kind: "tk_bloco",
      value: scopeName
    }  
  }

  define(lineCounter: number, id: string, token: Token): void {
    const error: string = `Erro linha ${lineCounter}, `
    if(this.symbols[id]){
      console.log(error + `Variavel '${id}' ja existe.`)
      return
    }

    if(!tk_id_regex.test(id)){
      console.log(error + `Nome de variavel '${id}' mal formado.`)
      return
    }
    this.symbols[id] = token
  }

  assign(lineCounter: number, left: string, right: Token): void {
    const error: string = `Erro linha ${lineCounter}, `
    if(!this.lookup(left)){
      console.log(error + `Variavel '${left}' nao foi definida.`)
      return
    }
    const l = this.lookup(left)
    if(right.kind !== 'tk_id'){
      if(this.lookup(left)?.type !== right.type){
        console.log(error + `Erro tipos de dados imcompativeis para variavel '${left}'. Esperava-se um(a) ${l?.type === 'number' ? 'NUMERO' : 'CADEIA'}.`)
        return
      }

      if(l) l.value = right.value
      return
    }
    if(!this.lookup(right.value as string)){
      console.log(error + `Variavel '${right.value}' nao foi definida.`)
      return
    }
    if(l?.type !== this.lookup(right.value as string)?.type){
      console.log(error + 
        `Erro tipos de dados imcompativeis para variavel '${l?.value}'. Esperava-se um(a) ${this.lookup(right.value as string)?.type === 'number' ? 'NUMERO' : 'CADEIA'}.`)
      return
    }
  
    if(l) l.value = this.lookup(right.value as string)?.value
  }

  lookup(id: string): { type?: DataType, kind: Kind, value?: Lexeme } | undefined {
    if(this.symbols[id]) return this.symbols[id]
    else if (this.parentScope) return this.parentScope.lookup(id)
  }
}