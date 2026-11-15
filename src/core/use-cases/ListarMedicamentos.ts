
import type { Medicamento } from "../domain/entities/Medicamento.js";

import type { MedicamentoRepository } from "../ports/MedicamentoRepository.js";

export class ListarMedicamentos {
  constructor(
    private readonly repository: MedicamentoRepository
  ) {}

  async execute(ativo?: boolean): Promise<Medicamento[]> {
    return this.repository.listar(ativo);
  }
}
