import { expect, type Locator, type Page } from '@playwright/test';
import { PesquisaProcessosPage } from './pesquisa-processos.page';

export interface AcompanhamentoRegistro {
  [coluna: string]: string;
}

export interface ResultadoAcompanhamento {
  processo: string;
  cabecalhos: string[];
  registros: AcompanhamentoRegistro[];
}

export class AcompanhamentoProcessualPage {
  private readonly page: Page;
  private readonly pesquisaProcessos: PesquisaProcessosPage;
  private readonly detalheProcesso: Locator;
  private readonly tabelaAndamentos: Locator;

  constructor(page: Page, baseURL = process.env.BASE_URL ?? '') {
    this.pesquisaProcessos = new PesquisaProcessosPage(page, baseURL);
    this.detalheProcesso = page.getByText(/Informações Processuais\s*-\s*Detalhe do Processo/i);
    this.tabelaAndamentos = page
      .getByRole('columnheader', { name: 'Andamentos do Processo', exact: true })
      .locator('xpath=ancestor::table[1]');
    this.page = page;
  }

  async consultarEExtrair(processo: string): Promise<ResultadoAcompanhamento> {
    await this.pesquisaProcessos.pesquisarProcesso(processo);
    await this.pesquisaProcessos.abrirResultado(processo);
    await expect(this.detalheProcesso).toBeVisible({ timeout: 15_000 });
    await expect(this.page.locator('body')).toContainText(processo);

    return this.extrairTabela(processo);
  }

  private async extrairTabela(processo: string): Promise<ResultadoAcompanhamento> {
    await expect(this.tabelaAndamentos).toBeVisible({ timeout: 15_000 });

    const linhas = await this.tabelaAndamentos.getByRole('row').all();
    let nomesColunas: string[] = [];
    let indiceCabecalho = -1;

    for (const [indice, linha] of linhas.entries()) {
      const cabecalhos = (await linha.getByRole('columnheader').allInnerTexts()).map((texto) => texto.trim());
      if (cabecalhos.length > 1) {
        nomesColunas = cabecalhos;
        indiceCabecalho = indice;
        break;
      }
    }

    if (nomesColunas.length === 0) {
      throw new Error(`A tabela de acompanhamento do processo ${processo} não apresentou cabeçalhos válidos.`);
    }

    const registros: AcompanhamentoRegistro[] = [];
    for (const linha of linhas.slice(indiceCabecalho + 1)) {
      const celulas = await linha.getByRole('cell').allInnerTexts();
      if (celulas.length === 0) {
        continue;
      }
      if (celulas.length !== nomesColunas.length) {
        throw new Error(
          `Estrutura inesperada na tabela do processo ${processo}: ${celulas.length} células para ${nomesColunas.length} colunas.`,
        );
      }

      registros.push(Object.fromEntries(nomesColunas.map((coluna, indice) => [coluna, celulas[indice]])));
    }

    return { processo, cabecalhos: nomesColunas, registros };
  }
}
