# Proveniência e modificações da versão de casos de uso

## Referências de delimitação

- **Obra originária:** `Enteee/plantuml-parser`
- **Licença:** Apache License 2.0
- **Commit-base:** `966a72e`
- **Commit funcional da extensão:** `f317b79`
- **Autora indicada das modificações:** Helaine Barreiros
- **Comando de auditoria:** `git diff 966a72e..f317b79`

## Síntese da contribuição

A versão modifica a gramática e os tipos da base, adiciona formatadores estruturados e os expõe pela API do parser. O formatador especializado produz as categorias `actors`, `usecases`, `packages`, `rectangles` e `relationships`, incluindo informações dos elementos contidos e detalhes das relações.

## Arquivos da modificação funcional

| Arquivo | Natureza da alteração |
|---|---|
| `src/plantuml.pegjs` | ampliação da gramática para construções requeridas pelos diagramas de casos de uso |
| `src/types.ts` | inclusão/ampliação de tipos para atores, casos de uso, grupos e relações |
| `src/formatters/structured.ts` | novo formatador JSON estruturado |
| `src/formatters/usecase_structured.ts` | novo formatador especializado em casos de uso |
| `src/formatters/graph.ts` | ajustes relacionados aos novos elementos e relações |
| `src/index.ts` | registro e exportação dos formatadores |
| `package.json` | identificação do pacote/binary e ajustes de configuração |
| `package-lock.json` | lockfile correspondente |
| `tsconfig.json` | ajustes de compilação |
| `actor_test.plantuml` | exemplo de entrada |
| `test-actor.js` | verificação de apoio |

## Exclusões autorais desta versão

Não integram esta versão as extensões posteriores para classes, sequências ou atividades. Também não se reivindica autoria sobre os arquivos e trechos preexistentes que permaneceram inalterados desde `966a72e`.

## Preservação da licença

O pacote final deve manter o arquivo `LICENSE`, os avisos aplicáveis e a identificação do repositório originário. A documentação do pedido deve informar que o objeto é uma versão derivada e que o alcance autoral pretendido corresponde às modificações identificadas pelo diff.
