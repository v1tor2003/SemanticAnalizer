﻿# SemanticAnalizer

Trabalho 2 de Compiladores - Analizador Semantico.

## Pré-requisitos

1. Node.js e npm instalados em sua máquina. Se ainda não os tiver instalado, acesse [Node.js](https://nodejs.org/) para obter a instalação.

## Clonando o repositório

1. Abra o terminal em sua máquina.
2. Use o seguinte comando para clonar o repositório:

   ```bash
   git clone https://github.com/v1tor2003/SemanticAnalizer
   ```

3. Navegue até o diretório do projeto recém-clonado:

   ```bash
   cd SemanticAnalizer
   ```

## Instalando as dependências

1. Instale as dependências do projeto com o seguinte comando:

   ```bash
   npm install
   ```

## Configuração

1. Verifique se o arquivo de configuração do TypeScript (`tsconfig.json`) está configurado conforme necessário para seu projeto.

## Rodando a aplicação

1. Execute o seguinte comando para compilar:

   ```bash
   tsc
   ```
12. Execute o seguinte comando para rodar:

   ```bash
   node dist/index.js caminhoArquivoEntrada.txt
   ```

## Estrutura do Projeto

- `src/`: Diretório contendo o código-fonte TypeScript.
- `dist/`: Diretório onde o código TypeScript é compilado para JavaScript.
- `tsconfig.json`: Arquivo de configuração do TypeScript.
- `package.json`: Arquivo de configuração do npm.
