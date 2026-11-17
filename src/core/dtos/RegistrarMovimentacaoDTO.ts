
import type {
  TipoMovimentacaoEstoque
} from "../domain/entities/MovimentacaoEstoque.js";

export interface RegistrarMovimentacaoDTO {
  loteId: string;
  tipo: TipoMovimentacaoEstoque;
  quantidade: number;
}
