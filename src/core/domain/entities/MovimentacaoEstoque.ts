
export type TipoMovimentacaoEstoque =
  "ENTRADA" | "SAIDA";

export interface MovimentacaoEstoque {
  id: string;
  loteId: string;
  tipo: TipoMovimentacaoEstoque;
  quantidade: number;
  criadaEm: string;
}
