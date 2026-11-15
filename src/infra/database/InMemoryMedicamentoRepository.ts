
import type { Medicamento } from "../../core/domain/entities/Medicamento.js";

import type { MedicamentoRepository } from "../../core/ports/MedicamentoRepository.js";

export class InMemoryMedicamentoRepository
  implements MedicamentoRepository {

  private readonly medicamentos: Medicamento[] = [
    {
      id: "1",
      nome: "Paracetamol 500 mg",
      principioAtivo: "Paracetamol",
      apresentacao: "Comprimido",
      ativo: true
    },
    {
      id: "2",
      nome: "Dipirona 500 mg",
      principioAtivo: "Dipirona",
      apresentacao: "Comprimido",
      ativo: true
    }
  ];

  async listar(): Promise<Medicamento[]> {
    return [...this.medicamentos];
  }
}
