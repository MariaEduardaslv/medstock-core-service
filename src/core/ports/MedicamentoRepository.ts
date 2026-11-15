
import type { Medicamento } from "../domain/entities/Medicamento.js";

export interface MedicamentoRepository {
  listar(ativo?: boolean): Promise<Medicamento[]>;
}
