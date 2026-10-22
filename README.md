# Automação CARF — Acompanhamento Processual

Projeto de testes E2E com Playwright e TypeScript para pesquisar processos no sistema CARF e extrair os registros da tabela **Andamentos do Processo**.

## Requisitos

- Node.js e npm compatíveis com as dependências do projeto.
- Firefox instalado pelo Playwright.
- Acesso de rede ao sistema CARF.
- Identificadores de processos autorizados configurados localmente em `PROCESSOS`.

## Instalação

```bash
npm install
npx playwright install --with-deps firefox
```

Crie o arquivo `.env` local (ele é ignorado pelo Git) e configure a URL da tela de Acompanhamento Processual e a lista privada de processos:

```dotenv
BASE_URL=https://carf.fazenda.gov.br/sincon/public/pages/ConsultarInformacoesProcessuais/consultarInformacoesProcessuais.jsf
PROCESSOS=<identificadores autorizados separados por vírgula>
```

`PROCESSOS` aceita identificadores separados por vírgula, ponto e vírgula ou quebra de linha. O carregamento remove espaços e duplicidades e valida o formato numérico esperado pelo CARF (cinco dígitos, ponto, seis dígitos, barra, quatro dígitos, hífen e dois dígitos).

**Privacidade:** não coloque identificadores em código, documentação, issues ou arquivos versionados. O `.env`, resultados e a lista local `pages/processos.list.ts` são ignorados pelo Git. A automação lê os processos exclusivamente da variável `PROCESSOS`; `pages/processos.list.ts` não é usada como fonte pelo teste.

## Executar

Executar todos os processos configurados:

```bash
npx playwright test
```

Executar apenas a automação de acompanhamento:

```bash
npx playwright test tests/acompanhamento-processual.spec.ts
```

Filtrar um teste pelo identificador configurado:

```bash
npx playwright test tests/acompanhamento-processual.spec.ts -g "trecho do título"
```

A execução usa Firefox. O Playwright distribui os testes paralelos entre **40% dos workers disponíveis**, valor padrão em `playwright.config.ts`. Cada processo é um teste independente e recebe seu próprio contexto e página. O número de workers pode ser sobrescrito pela variável `workers` com um valor numérico.

## Organização do código

- `pages/pesquisa-processos.page.ts`: locators e ações do formulário de pesquisa e abertura do resultado.
- `pages/acompanhamento-processual.page.ts`: coordena a consulta pela pesquisa, valida a tela de detalhes e extrai a tabela de andamentos.
- `pages/processos.config.ts`: lê `PROCESSOS`, valida o formato e elimina duplicidades.
- `pages/processos.list.ts`: arquivo local ignorado pelo Git; não é importado pela automação.
- `tests/acompanhamento-processual.spec.ts`: cria um teste por processo, orquestra o Page Object, valida o resultado e registra sucesso ou falha.

A extração mantém os cabeçalhos e valores apresentados pelo sistema. Cada registro é representado como um objeto cujas propriedades correspondem aos cabeçalhos encontrados na tabela.

## Dados e diagnósticos

Os arquivos de resultado são gravados em `test-results/acompanhamento/`:

- `dados-<processo>.json`: cabeçalhos e registros extraídos.
- `coleta-<processo>.json`: status, quantidade de registros e eventual erro.

Em falhas, o teste também anexa contexto ao relatório Playwright. A configuração existente preserva trace e vídeo em falhas/retries e captura screenshot em falhas. Os relatórios HTML ficam disponíveis em `playwright-report/`; para abri-los:

```bash
npx playwright show-report
```

O projeto também mantém os reporters `list`, `html` e `allure-playwright`. As pastas de resultados e relatórios são ignoradas pelo Git.

## Verificações estáticas

```bash
npx tsc --noEmit
npx eslint pages/acompanhamento-processual.page.ts pages/pesquisa-processos.page.ts pages/processos.config.ts tests/acompanhamento-processual.spec.ts
```

## Configuração e limites

- O teste depende de uma lista não vazia em `PROCESSOS`; configure-a antes de executar.
- A tela CARF usada pela automação apresenta o campo acessível **Número do processo**, o botão **Pesquisar** e a seção **Andamentos do Processo**. Alterações na interface podem exigir atualização dos locators nos Page Objects.
- O acesso ao CARF depende de disponibilidade do serviço e de conectividade no ambiente de execução.
- O workflow público do GitHub Actions executa apenas TypeScript e ESLint. O E2E não roda na Actions para evitar expor identificadores em logs e relatórios; execute-o localmente com o `.env` privado e não publique os artefatos de execução.
