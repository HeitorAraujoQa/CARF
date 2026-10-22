const identificadorProcesso = /^\d{5}\.\d{6}\/\d{4}-\d{2}$/;

function carregarProcessosConfigurados(): string[] {
  const valores = (process.env.PROCESSOS ?? '')
    .split(/[\r\n,;]+/)
    .map((valor) => valor.trim())
    .filter(Boolean);

  if (valores.length === 0) {
    throw new Error(
      'Configure PROCESSOS no arquivo .env local, com os identificadores separados por vírgula ou quebra de linha. Não versione esse arquivo.',
    );
  }

  const invalidos = valores.filter((valor) => !identificadorProcesso.test(valor));
  if (invalidos.length > 0) {
    throw new Error(`PROCESSOS contém identificadores em formato inválido: ${invalidos.join(', ')}`);
  }

  return [...new Set(valores)];
}

export const processos = carregarProcessosConfigurados();
