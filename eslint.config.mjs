import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // ── TypeScript type-aware para todos os arquivos (specs + page objects) ───
  //
  // Usa recommendedTypeChecked em vez de recommended para ativar
  // regras que exigem o type-checker do TypeScript — incluindo
  // @typescript-eslint/no-floating-promises, que detecta chamadas
  // async sem await, e captura argumentos faltando em funções tipadas.
  {
    files: ['tests/**/*.ts', 'pages/**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',

      // Detecta Promises sem await — inclui chamadas Playwright esquecidas
      '@typescript-eslint/no-floating-promises': 'error',

      // Argumento tipado como 'any' passado para função tipada (ex: fill(undefined))
      '@typescript-eslint/no-unsafe-argument': 'error',

      // Acesso a propriedade em valor 'any'
      '@typescript-eslint/no-unsafe-member-access': 'warn',

      // Retorno de função tipada como 'any' sendo usado como valor
      '@typescript-eslint/no-unsafe-return': 'warn',

      // Logs de debug não devem ficar no código
      'no-console': 'warn',
    },
  },

  // ── Playwright para specs e setups ──────────────────────────────────────
  {
    files: ['tests/**/*.spec.ts', 'tests/**/*.setup.ts'],
    extends: [playwright.configs['flat/recommended']],
    rules: {

      // ── BLOQUEIOS (error) ─────────────────────────────────────────────

      // Sleeps fixos tornam testes lentos e frágeis
      'playwright/no-wait-for-timeout': 'error',

      // Anti-pattern depreciado pelo Playwright
      'playwright/no-networkidle': 'error',

      // page.waitForSelector é API antiga — usar locator + waitFor
      'playwright/no-wait-for-selector': 'error',

      // page.waitForNavigation é depreciado — usar waitForURL ou waitForLoadState
      'playwright/no-wait-for-navigation': 'error',

      // test.only impede execução completa no CI
      'playwright/no-focused-test': 'error',

      // page.pause() não pode ficar em código de produção
      'playwright/no-page-pause': 'error',

      // Todo teste deve ter ao menos uma asserção — assertFunctionPatterns (regex, não glob:
      // assertFunctionNames faz match exato) reconhece os métodos verificar*/validar* do Page
      // Object (padrão do time para encapsular expect()), sem isso todo teste que só chama esses
      // métodos é falsamente reportado como sem asserção
      'playwright/expect-expect': ['error', { assertFunctionPatterns: ['^verificar', '^validar'] }],

      // expect() sem await — asserção nunca executada
      'playwright/valid-expect': 'error',

      // await faltando em outros métodos assíncronos do Playwright
      'playwright/missing-playwright-await': 'error',

      // expect() fora de um bloco test() — asserção órfã
      'playwright/no-standalone-expect': 'error',

      // ElementHandle é API depreciada — usar Locators
      'playwright/no-element-handle': 'error',

      // { force: true } bypassa verificações de acessibilidade e actionability
      'playwright/no-force-option': 'error',

      // beforeEach/afterEach duplicados no mesmo describe
      'playwright/no-duplicate-hooks': 'error',

      // page.evaluate() com eval — risco de segurança e fragilidade
      'playwright/no-eval': 'error',

      // Desativado nos blocos genéricos — ativado no bloco de specs abaixo
      'playwright/require-top-level-describe': 'off',
      'playwright/require-tags': 'off',

      // ── ALERTAS (warn) ──────────────────────────────────────────────────

      // .skip sem justificativa documentada
      'playwright/no-skipped-test': 'warn',

      // if/else dentro de testes indica design incorreto
      'playwright/no-conditional-in-test': 'warn',

      // Testes comentados esquecidos no código
      'playwright/no-commented-out-tests': 'warn',

      // Locator criado mas nunca usado
      'playwright/no-unused-locators': 'warn',

      // .nth() é frágil — preferir seletores semânticos
      'playwright/no-nth-methods': 'warn',

      // Prefere asserções web-first: expect(locator).toBeVisible()
      // em vez de expect(await locator.isVisible()).toBe(true)
      'playwright/prefer-web-first-assertions': 'warn',
    },
  },

  // ── Playwright para Page Objects ─────────────────────────────────────────
  //
  // Os mesmos anti-patterns proibidos em specs são proibidos em page objects.
  // Cobre tanto o padrão interno (tests/support/pages/) quanto o padrão
  // externo (pages/ na raiz), onde o bloco de specs não chegaria.
  //
  // Não inclui regras exclusivas de test() como expect-expect,
  // no-standalone-expect e require-tags, que não fazem sentido em POs.
  {
    files: [
      'tests/support/**/*.ts',
      'tests/pages/**/*.ts',
      'pages/**/*.ts',
    ],
    plugins: { playwright },
    rules: {

      // ── BLOQUEIOS (error) ─────────────────────────────────────────────

      // waitForTimeout é proibido também em page objects
      'playwright/no-wait-for-timeout': 'error',

      // waitForNavigation depreciado
      'playwright/no-wait-for-navigation': 'error',

      // waitForSelector depreciado
      'playwright/no-wait-for-selector': 'error',

      // networkidle depreciado
      'playwright/no-networkidle': 'error',

      // ElementHandle depreciado — usar Locators
      'playwright/no-element-handle': 'error',

      // { force: true } bypassa actionability checks
      'playwright/no-force-option': 'error',

      // await faltando em chamadas async do Playwright
      'playwright/missing-playwright-await': 'error',

      // expect() sem await
      'playwright/valid-expect': 'error',

      // page.evaluate() com eval
      'playwright/no-eval': 'error',

      // page.pause() em page objects
      'playwright/no-page-pause': 'error',

      // ── ALERTAS (warn) ──────────────────────────────────────────────────

      // Prefere asserções web-first
      'playwright/prefer-web-first-assertions': 'warn',

      // .nth() frágil
      'playwright/no-nth-methods': 'warn',

      // Locator criado mas nunca usado
      'playwright/no-unused-locators': 'warn',
    },
  },

  // ── Regras exclusivas para specs (não se aplicam a setups nem POs) ───────
  {
    files: ['tests/**/*.spec.ts'],
    rules: {
      // Todo teste deve estar dentro de um describe
      'playwright/require-top-level-describe': 'error',

      // Todo teste deve ter pelo menos uma tag (@smoke, @regression ou @flaky)
      'playwright/require-tags': 'error',
    },
  },

);
