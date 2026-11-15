
import type { Medicamento } from "../domain/entities/Medicamento.js";

import type { AtualizarMedicamentoDTO } from "../dtos/AtualizarMedicamentoDTO.js";

export interface AtualizarMedicamentoRepository {
  atualizar(
    id: string,
    dados: AtualizarMedicamentoDTO
  ): Promise<Medicamento | null>;
}
