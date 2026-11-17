
import type { ListarLotesRepository } from "../ports/ListarLotesRepository.js";

export class ListarLotes {

  constructor(
    private readonly repository: ListarLotesRepository
  ) {}

  async execute(medicamentoId: string) {

    // Verificar se o identificador foi informado
    if (
      typeof medicamentoId !== "string" ||
      !medicamentoId.trim()
    ) {
      throw new Error("ID do medicamento é obrigatório.");
    }

    // Remover espaços desnecessários
    const id = medicamentoId.trim();

    // Consultar os lotes do medicamento
    return this.repository.listarPorMedicamento(id);
  }
}
