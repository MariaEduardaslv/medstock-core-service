
import type { Lote } from "../domain/entities/Lote.js";

export interface ListarLotesRepository {
  listarPorMedicamento(medicamentoId: string): Promise<Lote[]>;
}
