import type { Medicamento } from "../domain/entities/Medicamento.js";

import type { CriarMedicamentoDTO } from "../dtos/CriarMedicamentoDTO.js";

import type { CriarMedicamentoRepository } from "../ports/CriarMedicamentoRepository.js";

export class CriarMedicamento {
  constructor(
    private readonly repository: CriarMedicamentoRepository
  ) {}

  async execute(
    dados: CriarMedicamentoDTO
  ): Promise<Medicamento> {

    // Validar os campos obrigatórios
    if (
      typeof dados.nome !== "string" ||
      typeof dados.principioAtivo !== "string" ||
      typeof dados.apresentacao !== "string"
    ) {
      throw new Error("Todos os campos são obrigatórios.");
    }

    // Remover espaços desnecessários
    const nome = dados.nome.trim();
    const principioAtivo = dados.principioAtivo.trim();
    const apresentacao = dados.apresentacao.trim();

    if (!nome || !principioAtivo || !apresentacao) {
      throw new Error("Todos os campos devem ser preenchidos.");
    }

    // Solicitar o cadastro ao repositório
    return this.repository.criar({
      nome,
      principioAtivo,
      apresentacao
    });
  }
}