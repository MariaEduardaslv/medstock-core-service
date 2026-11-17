
import type { CriarLoteDTO } from "../dtos/CriarLoteDTO.js";

import type { CriarLoteRepository } from "../ports/CriarLoteRepository.js";

export class CriarLote {

  constructor(
    private readonly repository: CriarLoteRepository
  ) {}

  async execute(dados: CriarLoteDTO) {

    // Verificar se os campos foram informados
    if (
      !dados ||
      typeof dados.medicamentoId !== "string" ||
      typeof dados.numeroLote !== "string" ||
      typeof dados.dataValidade !== "string"
    ) {
      throw new Error("Todos os campos do lote são obrigatórios.");
    }

    // Remover espaços desnecessários
    const medicamentoId = dados.medicamentoId.trim();
    const numeroLote = dados.numeroLote.trim();
    const dataValidade = dados.dataValidade.trim();

    // Impedir campos vazios
    if (!medicamentoId || !numeroLote || !dataValidade) {
      throw new Error("Todos os campos do lote são obrigatórios.");
    }

    // Verificar o formato da data
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataValidade)) {
      throw new Error("Data de validade inválida. Use AAAA-MM-DD.");
    }

    // Verificar se a data realmente existe
    const data = new Date(`${dataValidade}T00:00:00Z`);

    if (
      Number.isNaN(data.getTime()) ||
      data.toISOString().slice(0, 10) !== dataValidade
    ) {
      throw new Error("Data de validade inválida.");
    }

    // Encaminhar os dados ao repositório
    return this.repository.criar({
      medicamentoId,
      numeroLote,
      dataValidade
    });
  }
}
