# CLAUDE.md

Este arquivo reúne orientações para trabalhar neste repositório. Antes de alterar convenções ou configurações, confira os arquivos relacionados e os exemplos recentes da área afetada.

## Comandos

```bash
npm install
npx playwright install --with-deps   # primeira instalação dos browsers
cp .env.example .env                 # configure as variáveis necessárias para o ambiente

npx playwright test                  # suíte inteira
npx playwright test <arquivo>        # um spec específico
npx playwright test -g "<trecho do título>" # filtra testes pelo título
npm run test:ui                      # Playwright em modo UI
npm run codegen                      # geração interativa de código
npm run lint                         # ESLint
```

`HEADLESS=false` e `SLOWMO=<ms>` podem ser usados para depuração local, conforme a configuração do projeto. Não os use em CI. Consulte `.env.example`, `package.json` e `playwright.config.ts` para confirmar variáveis e scripts disponíveis.

## Dados locais de processos

A automação lê os identificadores pela variável `PROCESSOS` no `.env` local. Separe os valores por vírgula, ponto e vírgula ou quebras de linha. Não coloque identificadores diretamente no código nem versione o `.env`; `pages/processos.list.ts` também é um arquivo local ignorado pelo Git.

Exemplo de configuração local (use somente identificadores autorizados e não copie valores reais para este arquivo):

```dotenv
PROCESSOS=<identificadores separados por vírgula>
```

## Arquitetura e padrões

O repositório contém testes E2E com Playwright e TypeScript, organizados com o padrão Page Object Model.

- **`pages/template-base.page.ts`** contém a classe `BasePage` e funções compartilhadas, como `acessarSistema()`. Page Objects de telas ou features devem estendê-la quando fizer sentido e reutilizar suas ações comuns, evitando duplicar navegação, paginação ou exclusão.
- Page Objects ficam em `pages/`, organizados por módulo ou feature. Specs correspondentes ficam em `tests/`, seguindo a organização existente mais próxima. Os nomes dos arquivos podem variar entre módulos; confira os exemplos antes de criar novos.
- Ao criar ou atualizar specs, use como referência os testes recentes da mesma área. Em geral, os testes agrupam cenários com `test.describe`, preparam a navegação em hooks como `beforeEach` quando apropriado e organizam ações e verificações em `test.step` nomeados.
- Use tags e anotações de acordo com as convenções da feature. Nos specs novos, prefira os utilitários de `tests/utils/annotations.ts` (`criarAnotador` e `anotarTeste`) quando adequados; informe o responsável real pelo teste e não presuma um valor padrão.
- `test.describe.serial` só deve ser usado quando os testes realmente dependem de uma ordem ou estado compartilhado. Caso contrário, prefira testes independentes. Siga o padrão da feature existente, sem replicar automaticamente convenções de outro módulo.
- A configuração do ESLint em `eslint.config.mjs` inclui regras para Playwright e TypeScript, com regras específicas para `tests/`, `pages/` e specs. Consulte o arquivo para verificar regras e severidades atuais. Evite padrões desaconselhados, como `waitForTimeout`, `test.only` e `page.pause()`, e use seletores resilientes e asserções explícitas.
- Em `playwright.config.ts`, captura de screenshots e vídeos está configurada intencionalmente para registrar evidências também em execuções bem-sucedidas. Preserve essa configuração, a menos que a tarefa solicite sua alteração.

## Commits

A convenção observada é `<tipo>: <descrição objetiva>`, usando tipos como `feat`, `fix`, `refactor` ou `chore`. Para alterações maiores, uma descrição complementar pode ser incluída. Não crie commits sem solicitação explícita.
