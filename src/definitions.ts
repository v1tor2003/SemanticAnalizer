export const KEYWORDS = {
  openBlock: "BLOCO",
  closeBlock: "FIM",
  printToken: "PRINT"
}

export type DataType = "number" | "string"
export type Kind = "tk_bloco" | "tk_id" | "tk_numero" | "tk_cadeia"
export type Lexeme = number | string

export type Token = {
  type?: DataType
  kind: Kind 
  value?: Lexeme
}

export interface SymbolTable{
  [id: string]: Token
}

export const tk_id_regex: RegExp = /^[a-z][a-z0-9_]*$/
export const tk_block_regex: RegExp = /^_[a-zA-Z0-9]+_$/
export const tk_string_literal_regex: RegExp = /^".*"$/
export const tk_number_regex: RegExp = /^[+-]?(\d+(\.\d*)?|\.\d+)$/