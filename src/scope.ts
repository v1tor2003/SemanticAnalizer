import {
  SymbolTable, 
  Token, 
  tk_block_regex, 
  tk_id_regex } 
from "./definitions"
// Definicao da classe Scope
export class Scope {
  public symbols: SymbolTable = {} // tabela de simbolos do escopo
  /**
   * @param {number} lineCounter linha atual de execucao
   * @param {string} scopeName nome do escopo
   * @param {Scope | null} parentScope referencia para o pai ou antecessor do escopo na pilha
   * @returns {void} 
   * metodo construtor da class Scope, sem retorno
  */
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
  /**
   * Metodo responsavel por definir novas variaveis na tabela e sua informacoes
   * @param {number} lineCounter linha atual de execucao
   * @param {string} id variavel a ser definida na tabela
   * @param {Token} token token associado a variavel
   * @returns {void} 
   * verifica erros e perfoma a insercao, sem retorno
  */
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
  /**
   * Metodo responsavel por assinar valores a variaveis da tabela
   * @param {number} lineCounter linha atual de execucao
   * @param {string} left variavel a ser assinada
   * @param {Token} right token contendo o valor e informacoes para tarefa
   * @returns {void} 
   * verifica erros e perfoma a insercao, sem retorno
  */
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
  /**
   * Metodo responsavel por procurar uma varivael na tabela do escopo atual, se nao exitir, no do pai em diante ate o global
   * @param {string} id variavel a ser econtrada
   * @returns {Token | undefined} 
   * retorna o token associado ao id da variavel e se nao exitir retorna undefined
  */
  lookup(id: string): Token | undefined {
    if(this.symbols[id]) return this.symbols[id]
    else if (this.parentScope) return this.parentScope.lookup(id)
  }
}