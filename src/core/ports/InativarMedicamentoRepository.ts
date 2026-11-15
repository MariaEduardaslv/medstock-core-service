
export interface InativarMedicamentoRepository {
  inativar(id: string): Promise<boolean>;
}
