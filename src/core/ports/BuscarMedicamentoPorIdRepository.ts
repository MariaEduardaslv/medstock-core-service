
import type { Medicamento } from "../domain/entities/Medicamento.js";

export interface BuscarMedicamentoPorIdRepository {
  buscarPorId(id: string): Promise<Medicamento | null>;
}
