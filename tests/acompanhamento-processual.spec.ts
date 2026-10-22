import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { AcompanhamentoProcessualPage } from '../pages/acompanhamento-processual.page';
import { processos } from '../pages/processos.config';

function obterMensagemErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : String(erro);
}

test.describe('Acompanhamento Processual', { tag: ['@regression'] }, () => {
  test.describe.configure({ mode: 'parallel' });

  for (const processo of processos) {
    test(`Pesquisar e extrair acompanhamento do processo ${processo}`, async ({ page }, testInfo) => {
      const acompanhamento = new AcompanhamentoProcessualPage(page);
      const pastaResultados = path.resolve(testInfo.project.outputDir, 'acompanhamento');
      let status: 'sucesso' | 'falha' = 'falha';
      let registros = 0;
      let erroDetalhe: string | undefined;

      try {
        const resultado = await test.step('Consultar processo e extrair acompanhamento', () =>
          acompanhamento.consultarEExtrair(processo),
        );

        expect(resultado.processo).toBe(processo);
        expect(resultado.cabecalhos.length).toBeGreaterThan(0);
        registros = resultado.registros.length;
        status = 'sucesso';

        await testInfo.attach(`acompanhamento-${processo.replaceAll(/[./-]/g, '_')}.json`, {
          body: JSON.stringify(resultado, null, 2),
          contentType: 'application/json',
        });

        await mkdir(pastaResultados, { recursive: true });
        await writeFile(
          path.resolve(pastaResultados, `dados-${processo.replaceAll(/[./-]/g, '_')}.json`),
          JSON.stringify(resultado, null, 2),
        );
      } catch (erro) {
        erroDetalhe = obterMensagemErro(erro);
        await testInfo.attach('contexto-da-falha.json', {
          body: JSON.stringify({ processo, erro: erroDetalhe, url: page.url() }, null, 2),
          contentType: 'application/json',
        });
        throw new Error(`Falha para o processo ${processo}: ${erroDetalhe}`, { cause: erro });
      } finally {
        await mkdir(pastaResultados, { recursive: true });
        await writeFile(
          path.resolve(pastaResultados, `coleta-${processo.replaceAll(/[./-]/g, '_')}.json`),
          JSON.stringify({ processo, registros, status, erro: erroDetalhe }, null, 2),
        );
      }
    });
  }
});
