type DataType = "number" | "string"
type Kind = "tk_bloco" | "tk_id" | "tk_numero" | "tk_cadeia"
export type Lexeme = number | string
export type Token = {
  type?: DataType
  kind: Kind 
  value?: Lexeme
}

interface SymbolTable{
  [id: string]: Token
}

export class Scope {
  public symbols: SymbolTable = {}
  private static tk_id_regex: RegExp = /^[a-z][a-z0-9_]*$/
  private static tk_block_regex: RegExp = /^_[a-zA-Z0-9]+_$/

  constructor(
    private scopeName: string,
    public parentScope: Scope | null = null
  ){
    try {
      if(!Scope.tk_block_regex.test(scopeName)) throw new Error()
      this.symbols[scopeName] = {
        kind: "tk_bloco",
        value: scopeName
      }  
    } catch (error: unknown) {
      console.log(`Nome de escopo mal formado '${scopeName}'`)
    }
    
  }

  define(lineCounter: number, id: string, token: Token): void {
    const error: string = `Erro linha ${lineCounter}, `
    if(this.symbols[id]){
      console.log(error + `Variavel '${id}' ja existe.`)
      return
    }

    if(!Scope.tk_id_regex.test(id)){
      console.log(error + `Nome de variavel '${id}' mal formado.`)
      return
    }
    this.symbols[id] = token
  }

  assign(lineCounter: number, left: string, right: Token): void {
    const error: string = `Erro linha ${lineCounter}, `
    if(!this.lookup(left)){
      console.log(error + `Variavel '${left}' nao existe.`)
      return
    }
    const l = this.lookup(left)
    if(right.kind !== 'tk_id'){
      if(this.lookup(left)?.type !== right.type){
        console.log(error + `Erro tipo de dado nao compativeis ${l?.type}: [${left}] e ${right.type} [${right.value}].`)
        return
      }
      //may be lookyp
      if(l) l.value = right.value
      return
    }
    if(!this.lookup(right.value as string)){
      console.log(error + `Variavel '${right.value}' nao existe.`)
      return
    }
    if(l?.type !== this.lookup(right.value as string)?.type){
      console.log(error + 
        `Erro tipo de dado nao compativeis ${l?.type}: [${l?.value}] e ${this.lookup(right.value as string)?.type}: [${this.lookup(right.value as string)?.value}].`)
      return
    }
  
    if(l) l.value = this.lookup(right.value as string)?.value
  }

  lookup(id: string): { type?: DataType, kind: Kind, value?: Lexeme } | undefined {
    if(this.symbols[id]) return this.symbols[id]
    else if (this.parentScope) return this.parentScope.lookup(id)
  }
}