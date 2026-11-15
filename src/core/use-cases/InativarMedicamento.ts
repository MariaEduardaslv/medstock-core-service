
import type { InativarMedicamentoRepository } from "../ports/InativarMedicamentoRepository.js";

export class InativarMedicamento {
  constructor(
    private readonly repository: InativarMedicamentoRepository
  ) {}

  async execute(id: string): Promise<boolean> {

    // Verificar se o ID foi informado
    if (!id || !id.trim()) {
      throw new Error("O ID do medicamento é obrigatório.");
    }

    // Solicitar a inativação ao repositório
    return this.repository.inativar(id);
  }
}
