
import { describe, it, expect, vi } from "vitest";

import { CriarLote } from "../src/core/use-cases/CriarLote.js";

import type { CriarLoteRepository } from "../src/core/ports/CriarLoteRepository.js";

describe("CriarLote", () => {

  // Teste 1: Cadastrar lote válido
  it("deve cadastrar um lote com dados válidos", async () => {

    const repository: CriarLoteRepository = {
      criar: vi.fn(async (dados) => ({
        id: "lote-1",
        ...dados,
        quantidadeAtual: 0
      }))
    };

    const criarLote = new CriarLote(repository);

    const resultado = await criarLote.execute({
      medicamentoId: "medicamento-1",
      numeroLote: "  LOT001  ",
      dataValidade: "2027-05-10"
    });

    expect(resultado.numeroLote).toBe("LOT001");
    expect(resultado.quantidadeAtual).toBe(0);

    expect(repository.criar).toHaveBeenCalledWith({
      medicamentoId: "medicamento-1",
      numeroLote: "LOT001",
      dataValidade: "2027-05-10"
    });
  });

  // Teste 2: Número do lote vazio
  it("não deve cadastrar lote sem número", async () => {

    const repository: CriarLoteRepository = {
      criar: vi.fn()
    };

    const criarLote = new CriarLote(repository);

    await expect(
      criarLote.execute({
        medicamentoId: "medicamento-1",
        numeroLote: "",
        dataValidade: "2027-05-10"
      })
    ).rejects.toThrow(
      "Todos os campos do lote são obrigatórios."
    );

    expect(repository.criar).not.toHaveBeenCalled();
  });

  // Teste 3: Formato de data incorreto
  it("não deve aceitar formato de data inválido", async () => {

    const repository: CriarLoteRepository = {
      criar: vi.fn()
    };

    const criarLote = new CriarLote(repository);

    await expect(
      criarLote.execute({
        medicamentoId: "medicamento-1",
        numeroLote: "LOT002",
        dataValidade: "10/05/2027"
      })
    ).rejects.toThrow(
      "Data de validade inválida. Use AAAA-MM-DD."
    );

    expect(repository.criar).not.toHaveBeenCalled();
  });

  // Teste 4: Data inexistente
  it("não deve aceitar uma data inexistente", async () => {

    const repository: CriarLoteRepository = {
      criar: vi.fn()
    };

    const criarLote = new CriarLote(repository);

    await expect(
      criarLote.execute({
        medicamentoId: "medicamento-1",
        numeroLote: "LOT003",
        dataValidade: "2027-02-30"
      })
    ).rejects.toThrow(
      "Data de validade inválida."
    );

    expect(repository.criar).not.toHaveBeenCalled();
  });

});
