import type { Medicamento } from "../domain/entities/Medicamento.js";

import type { CriarMedicamentoDTO } from "../dtos/CriarMedicamentoDTO.js";

export interface CriarMedicamentoRepository {
  criar(dados: CriarMedicamentoDTO): Promise<Medicamento>;
}