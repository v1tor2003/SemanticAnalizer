// Palavras chaves da linguagem
export const KEYWORDS = {
  openBlock: "BLOCO",
  closeBlock: "FIM",
  printToken: "PRINT"
}
// Tipo de dado do token
export type DataType = "number" | "string"
// Tipos do token
export type Kind = "tk_bloco" | "tk_id" | "tk_numero" | "tk_cadeia"
// Estrutura de um lexema
export type Lexeme = number | string

// Estrutura de um Token
export type Token = {
  type?: DataType
  kind: Kind 
  value?: Lexeme
}
// Estrutua da tabela de simbolos
export interface SymbolTable{
  [id: string]: Token
}
// Regex para identificar o id
export const tk_id_regex: RegExp = /^[a-z][a-z0-9_]*$/
// Regex para identificar o nome de bloco
export const tk_block_regex: RegExp = /^_[a-zA-Z0-9]+_$/
// Regex para identificar a cadeia
export const tk_string_literal_regex: RegExp = /^".*"$/
// Regex para identificar o numero
export const tk_number_regex: RegExp = /^[+-]?(\d+(\.\d*)?|\.\d+)$/