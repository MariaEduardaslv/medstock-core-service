
import { describe, it, expect, vi } from "vitest";

import { ListarLotes } from "../src/core/use-cases/ListarLotes.js";

import type { ListarLotesRepository } from "../src/core/ports/ListarLotesRepository.js";

describe("ListarLotes", () => {

  // TESTE 1: Listar lotes existentes
  it("deve listar os lotes de um medicamento", async () => {

    const medicamentoId = "medicamento-1";

    const lotes = [
      {
        id: "lote-1",
        medicamentoId,
        numeroLote: "LOT001",
        dataValidade: "2027-05-10",
        quantidadeAtual: 0
      }
    ];

    const repository: ListarLotesRepository = {
      listarPorMedicamento: vi.fn(async () => lotes)
    };

    const listarLotes = new ListarLotes(repository);

    const resultado = await listarLotes.execute(medicamentoId);

    expect(resultado).toEqual(lotes);

    expect(repository.listarPorMedicamento)
      .toHaveBeenCalledWith(medicamentoId);
  });

  // TESTE 2: Medicamento sem lotes
  it("deve retornar lista vazia quando não houver lotes", async () => {

    const repository: ListarLotesRepository = {
      listarPorMedicamento: vi.fn(async () => [])
    };

    const listarLotes = new ListarLotes(repository);

    const resultado = await listarLotes.execute("medicamento-2");

    expect(resultado).toEqual([]);
  });

  // TESTE 3: ID vazio
  it("não deve listar lotes sem ID do medicamento", async () => {

    const repository: ListarLotesRepository = {
      listarPorMedicamento: vi.fn()
    };

    const listarLotes = new ListarLotes(repository);

    await expect(
      listarLotes.execute("")
    ).rejects.toThrow(
      "ID do medicamento é obrigatório."
    );

    expect(repository.listarPorMedicamento)
      .not.toHaveBeenCalled();
  });

});
