
import type {
  RegistrarMovimentacaoDTO
} from "../dtos/RegistrarMovimentacaoDTO.js";

import type {
  RegistrarMovimentacaoRepository
} from "../ports/RegistrarMovimentacaoRepository.js";

export class RegistrarMovimentacao {

  constructor(
    private readonly repository: RegistrarMovimentacaoRepository
  ) {}

  async execute(dados: RegistrarMovimentacaoDTO) {

    // Verificar se os dados foram informados
    if (!dados || typeof dados !== "object") {
      throw new Error(
        "Os dados da movimentação são obrigatórios."
      );
    }

    // Validar o identificador do lote
    if (
      typeof dados.loteId !== "string" ||
      !dados.loteId.trim()
    ) {
      throw new Error("ID do lote é obrigatório.");
    }

    // Validar o tipo da movimentação
    if (
      dados.tipo !== "ENTRADA" &&
      dados.tipo !== "SAIDA"
    ) {
      throw new Error(
        "O tipo deve ser ENTRADA ou SAIDA."
      );
    }

    // Validar a quantidade
    if (
      typeof dados.quantidade !== "number" ||
      !Number.isSafeInteger(dados.quantidade) ||
      dados.quantidade <= 0
    ) {
      throw new Error(
        "A quantidade deve ser um número inteiro positivo."
      );
    }

    // Encaminhar os dados válidos ao repositório
    return this.repository.registrar({
      loteId: dados.loteId.trim(),
      tipo: dados.tipo,
      quantidade: dados.quantidade
    });
  }
}
