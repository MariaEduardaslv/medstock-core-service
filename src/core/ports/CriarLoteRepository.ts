
import type { CriarLoteDTO } from "../dtos/CriarLoteDTO.js";
import type { Lote } from "../domain/entities/Lote.js";

export interface CriarLoteRepository {
  criar(dados: CriarLoteDTO): Promise<Lote>;
}
