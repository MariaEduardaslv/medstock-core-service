
import type { Medicamento } from "../domain/entities/Medicamento.js";

import type { BuscarMedicamentoPorIdRepository } from "../ports/BuscarMedicamentoPorIdRepository.js";

export class BuscarMedicamentoPorId {
  constructor(
    private readonly repository: BuscarMedicamentoPorIdRepository
  ) {}

  async execute(id: string): Promise<Medicamento | null> {
    // Verificar se o ID foi informado
    if (!id || !id.trim()) {
      throw new Error("O ID do medicamento é obrigatório.");
    }

    // Solicitar a busca ao repositório
    return this.repository.buscarPorId(id);
  }
}
