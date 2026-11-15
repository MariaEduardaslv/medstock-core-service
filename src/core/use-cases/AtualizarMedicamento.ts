
import type { Medicamento } from "../domain/entities/Medicamento.js";

import type { AtualizarMedicamentoDTO } from "../dtos/AtualizarMedicamentoDTO.js";

import type { AtualizarMedicamentoRepository } from "../ports/AtualizarMedicamentoRepository.js";

export class AtualizarMedicamento {
  constructor(
    private readonly repository: AtualizarMedicamentoRepository
  ) {}

  async execute(
    id: string,
    dados: AtualizarMedicamentoDTO
  ): Promise<Medicamento | null> {

    // Verificar se o ID foi informado
    if (!id || !id.trim()) {
      throw new Error("O ID do medicamento é obrigatório.");
    }

    // Verificar se os dados são válidos
    if (
      !dados ||
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

    // Verificar campos vazios
    if (!nome || !principioAtivo || !apresentacao) {
      throw new Error("Todos os campos devem ser preenchidos.");
    }

    // Verificar os limites do banco de dados
    if (
      nome.length > 150 ||
      principioAtivo.length > 150 ||
      apresentacao.length > 100
    ) {
      throw new Error("Um ou mais campos ultrapassam o tamanho permitido.");
    }

    // Solicitar atualização ao repositório
    return this.repository.atualizar(id, {
      nome,
      principioAtivo,
      apresentacao
    });
  }
}
