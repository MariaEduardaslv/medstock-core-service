
import type {
  MovimentacaoEstoque
} from "../domain/entities/MovimentacaoEstoque.js";

import type {
  RegistrarMovimentacaoDTO
} from "../dtos/RegistrarMovimentacaoDTO.js";

export interface RegistrarMovimentacaoRepository {

  registrar(
    dados: RegistrarMovimentacaoDTO
  ): Promise<MovimentacaoEstoque>;

}
