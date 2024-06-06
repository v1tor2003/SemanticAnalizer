import * as fsPromises from 'fs/promises'
import { Scope } from "./scope"
import { KEYWORDS, Kind, Lexeme, Token, tk_id_regex, tk_number_regex, tk_string_literal_regex } from './definitions'
// Definicao da classe Interpreter
// OBS: A Pilha de escopos usa a memoria e manipulcao dela para representar essa estrutura 
export class Interpreter {
  private static lineCounter: number = 0      // conta linha atual para o uso no relatorio de erros
  private globalScope = new Scope(Interpreter.lineCounter, '_GLOBAL_') // cria a instancia do escopo global para executar o programa
  private currScope = this.globalScope  // guarda a refencia do elemento atual da pilha

  constructor(){}
  /**
   * @param {string[]} tokens tokens como string lidos da linha
   * @returns {void} 
   * ecolhe a acao a ser executada pela class Interpreter, sem retorno
  */
  private exec(tokens: string[]): void{
    Interpreter.lineCounter++
    if(tokens.length === 0) return
             
    if(tokens[0] === KEYWORDS.openBlock) this.createScope(tokens[1])
    else if(tokens[0] === KEYWORDS.closeBlock) this.exitScope()
    else if(tokens[0] === KEYWORDS.printToken) this.print(tokens[1])
    else this.process(tokens)
  }
  /**
   * Executa o push na pilha de escopos, criando o objeto e a referencia na memoria para a classe Scope
   * @returns {void} 
   * modifica a memoria, sem retorno
  */
  private createScope(blockId: string): void{ 
    if(this.currScope.lookup(blockId)) {
      console.log(`Erro linha ${Interpreter.lineCounter}, Escopo '${blockId}' ja foi definido.`)
      return
    }
    
    this.currScope = new Scope(Interpreter.lineCounter, blockId, this.currScope)
  }
  /**
   * Executa o pop na pilha de escopos, removendo a referencia da memoria levendo a coleta do elemento da class Scope pela linguagem (JavaScript)
   * @returns {void} 
   * modifica a memoria, sem retorno
  */
  private exitScope(): void{ 
    if(this.currScope !== this.globalScope) this.currScope = this.currScope.parentScope!
  }
  /**
   * Metodo responsavel por logar no console o valor associado ao id
   * @param {string} id variavel a ser assinada
   * @returns {void} 
   * faz a chamada para o objeto do stdout console, retorno na tela
  */
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
  /**
   * Metodo processa o array de elementos para definicoes ou atribuicoes (chamando os respectivos metodos)
   * @param {string[]} tokens tokens como string
   * @returns {void} 
   * metodo decide entre qual funcao chamar, sem retorno
  */
  private process(tokens: string[]): void {
    if(tokens[0] !== "NUMERO" && tokens[0] !== "CADEIA"){
      const atr: string = tokens.join(' ')
      const operands: string[] = atr.split('=')
      this.processAssign(operands[0].trim(), operands[1].trim())
    } else this.processDef(tokens)
  }
  /**
   * Metodo monta o token com seu valor para ser assinado a uma varivel existente
   * @param {string} left variavel a ser assinada
   * @param {string} right variavel ou literal contendo o novo valor
   * @returns {void} 
   * metodo delega a tarefa a class Scope, sem retornos
  */
  private processAssign(left: string, right: string): void{
    let t: Token
    if(tk_string_literal_regex.test(right)){
      t = {
        kind: 'tk_cadeia',
        type: 'string',
        value: right.slice(1, -1)
      }
    }else if(tk_number_regex.test(right)){
      t = {
        kind: 'tk_numero',
        type: 'number',
        value: parseFloat(right)
      }
    }else t = { kind: 'tk_id', value: right}

    this.currScope.assign(Interpreter.lineCounter, left, t)
  }
  /**
   * Metodo testa as possibilidade do token e seu devido parser
   * @param {string} token token como string
   * @returns {Lexeme | undefined} 
   * retorno parser correspondente ao tipo
  */
  private parseToken(type: string, token: string): Lexeme | undefined {
    switch (type) {
      case "NUMERO":
        return this.parseNumberToken(token)
      case "CADEIA":
        return this.parseStringToken(token)
      default:
        console.error(`Erro linha ${Interpreter.lineCounter}, Tipo desconhecido: ${type}`)
        return
    }
  }
  /**
   * Metodo testa se o token eh uma constante numerica ou se precisa consultar a tabela
   * @param {string} token token como string
   * @returns {Lexeme | undefined} 
   * o metodo retorna o lexema ou faz a chamada do metodo para consultar a tabela
  */
  private parseNumberToken(token: string) {
    if (tk_number_regex.test(token)) return parseFloat(token)
    return this.lookupAndValidateToken(token, 'tk_numero', 'NUMERO')
  } 
  /**
   * Metodo testa se o token eh uma string literal ou se precisa consultar a tabela
   * @param {string} token token como string
   * @returns {Lexeme | undefined} 
   * o metodo retorna o lexema ou faz a chamada do metodo para consultar a tabela
  */
  private parseStringToken(token: string): Lexeme | undefined {
    if (tk_string_literal_regex.test(token)) return token.slice(1, -1)
    return this.lookupAndValidateToken(token, 'tk_cadeia', 'NUMERO')
  }
  /**
   * Metodo que dirige a classe, sendo responsavel por interpretar um programa (arquivo.txt)
   * @param {string} token token como string
   * @param {Kind} expectedKind tipo esperado para o token
   * @param {string} typeDescription descricao para o tipo de token
   * @returns {Lexeme | undefined} valor ou lexema correspondente associado ao id ou undefined se nao achar nada 
   * o metodo valida e procura o token na tabela de simbolos do escopo de acordo com a necessidade
  */
  private lookupAndValidateToken(token: string, expectedKind: Kind, typeDescription: string): Lexeme | undefined
  {
    if (!tk_id_regex.test(token)) {
      console.error(`Erro linha ${Interpreter.lineCounter}, Erro de tipos incompativeis para constante '${token}'.`)
      return
    }
    
    const foundId = this.currScope.lookup(token)
    if (!foundId) {
        console.error(`Erro linha ${Interpreter.lineCounter}, Variavel '${token}' nao foi definida.`);
        return;
    }
    
    if (foundId.kind !== expectedKind) {
        console.error(`Erro linha ${Interpreter.lineCounter}, Erro de tipos incompativeis para variavel '${token}'. Esperava-se um(a) ${typeDescription}.`);
        return;
    }

    return foundId.value;
  }
  /**
   * Metodo processa a definicao de variaveis, levando em conta as regras de tipo e definicao
   * @param {string[]} tokens tokens lidos da linha atual em forma de string
   * @returns {void} 
   * o metodo vai quebrando o array de acordo com a quantidade de elementos lidos em cada chamada recursiva
   * ate que nao sobre mais elementos a serem processados no array
  */
  private processDef(tokens: string[]): void{
    const type = tokens.shift()
    if (tokens.length === 0) return
    if (tokens[1] === '=') {
        let v: Lexeme | undefined = this.parseToken(type as string, tokens[2])
        if(v === undefined) return
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
  /**
   * Metodo que dirige a classe, sendo responsavel por interpretar um programa (arquivo.txt)
   * @param {string} program caminho do programa 
   * @returns {Promise<void>} 
   * o metodo executa linha a linha do arquivo performando um parse para formatar a linha de acordo
  */
  public async interpret(program: string): Promise<void>{
    for await(const line of await this.readFile(program)){
      const parsedLine = this.splitLine(line)
      this.exec(parsedLine)
    }
  }
  /**
   * Metodo que quebra as linha de acordo com as , e espacos
   * @param {string} line linha em forma de string
   * @returns {string[]} 
   * o metodo retorna um array contendos os elementos da linha
  */
  private splitLine(line: string): string[] {
    line = line.trim()
    
    if (line.startsWith('NUMERO') || line.startsWith('CADEIA')) {
      const type = line.split(' ')[0]
      const rest = line.substring(type.length).trim()
      const parts = rest.split(/[, ]+/).map(part => part.trim())

      const finalArray = [type]
        
      let inQuotes = false;
      let quotedString = '';

      for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
            
          if (part.includes('=')) {
              const [key, value] = part.split('=').map(p => p.trim())
                
              if (value.startsWith('"') && value.endsWith('"')) finalArray.push(key, '=', value)
              else if (value.startsWith('"')) {
                inQuotes = true
                quotedString = value
                finalArray.push(key, '=')
              } else finalArray.push(key, '=', value)
                
          } else if (inQuotes) {
              quotedString += ' ' + part
                
              if (part.endsWith('"')) {
                finalArray.push(quotedString)
                inQuotes = false
                quotedString = ''
              }
          } else finalArray.push(part)
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
   * Metodo que realiza a leitura do arquivo de entrada .txt.
   * @param {string} path caminho do arquivo
   * @returns {Promise<AsyncIterable<string>>} 
   * o metodo retorna um objeto contendo as linhas
  */
  private async readFile(path: string): Promise<AsyncIterable<string>> {
    try { return (await fsPromises.open(path, 'r')).readLines() } 
    catch (error: unknown) {
      throw new Error('Erro ao abrir arquivo: ' + error)
    }
  }
}