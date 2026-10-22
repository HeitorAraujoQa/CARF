import { expect, type Locator, type Page } from '@playwright/test';

export class PesquisaProcessosPage {
  private readonly campoNumeroProcesso: Locator;
  private readonly botaoPesquisar: Locator;

  constructor(
    private readonly page: Page,
    private readonly baseURL = process.env.BASE_URL ?? '',
  ) {
    this.campoNumeroProcesso = page.getByRole('textbox', {
      name: 'Número do processo',
      exact: true,
    });
    this.botaoPesquisar = page.getByRole('button', {
      name: 'Pesquisar',
      exact: true,
    });
  }

  async pesquisarProcesso(processo: string): Promise<void> {
    if (!this.baseURL) {
      throw new Error('BASE_URL não foi configurada para acessar o CARF.');
    }

    await this.page.goto(this.baseURL, { waitUntil: 'domcontentloaded' });
    await expect(this.page.locator('body')).toBeVisible();
    await expect(this.campoNumeroProcesso).toBeVisible();
    await this.campoNumeroProcesso.fill(processo);
    await expect(this.botaoPesquisar).toBeVisible();
    await this.botaoPesquisar.click();
    await expect(this.processoNaPagina(processo)).toBeVisible({ timeout: 15_000 });
  }

  async abrirResultado(processo: string): Promise<void> {
    const resultado = this.processoNaPagina(processo);
    await expect(resultado).toBeVisible();
    await resultado.click();
  }

  private processoNaPagina(processo: string): Locator {
    return this.page.getByText(processo, { exact: true });
  }
}
