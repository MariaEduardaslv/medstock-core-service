
import { describe, it, expect, vi } from "vitest";

import { RegistrarMovimentacao } from "../src/core/use-cases/RegistrarMovimentacao.js";

import type { RegistrarMovimentacaoRepository } from "../src/core/ports/RegistrarMovimentacaoRepository.js";

import type { RegistrarMovimentacaoDTO } from "../src/core/dtos/RegistrarMovimentacaoDTO.js";

describe("RegistrarMovimentacao", () => {

  const loteId =
    "ad61979d-3bc1-4e0e-8a95-20606ef0f763";

  // TESTE 1: Registrar entrada válida
  it("deve registrar uma entrada de estoque", async () => {

    const repository: RegistrarMovimentacaoRepository = {
      registrar: vi.fn(async (dados) => ({
        id: "mov-1",
        ...dados,
        criadaEm: "2026-11-15T12:00:00Z"
      }))
    };

    const registrar = new RegistrarMovimentacao(repository);

    const resultado = await registrar.execute({
      loteId,
      tipo: "ENTRADA",
      quantidade: 100
    });

    expect(resultado.tipo).toBe("ENTRADA");
    expect(resultado.quantidade).toBe(100);

    expect(repository.registrar).toHaveBeenCalledWith({
      loteId,
      tipo: "ENTRADA",
      quantidade: 100
    });
  });

  // TESTE 2: Registrar saída válida
  it("deve registrar uma saída de estoque", async () => {

    const repository: RegistrarMovimentacaoRepository = {
      registrar: vi.fn(async (dados) => ({
        id: "mov-2",
        ...dados,
        criadaEm: "2026-11-15T12:00:00Z"
      }))
    };

    const registrar = new RegistrarMovimentacao(repository);

    const resultado = await registrar.execute({
      loteId,
      tipo: "SAIDA",
      quantidade: 1
    });

    expect(resultado.tipo).toBe("SAIDA");
    expect(resultado.quantidade).toBe(1);

    expect(repository.registrar).toHaveBeenCalledOnce();
  });

  // TESTE 3: Rejeitar lote sem ID
  it("não deve aceitar ID do lote vazio", async () => {

    const repository: RegistrarMovimentacaoRepository = {
      registrar: vi.fn()
    };

    const registrar = new RegistrarMovimentacao(repository);

    await expect(
      registrar.execute({
        loteId: "",
        tipo: "ENTRADA",
        quantidade: 10
      })
    ).rejects.toThrow("ID do lote é obrigatório.");

    expect(repository.registrar).not.toHaveBeenCalled();
  });

  // TESTE 4: Rejeitar quantidade zero
  it("não deve aceitar quantidade zero", async () => {

    const repository: RegistrarMovimentacaoRepository = {
      registrar: vi.fn()
    };

    const registrar = new RegistrarMovimentacao(repository);

    await expect(
      registrar.execute({
        loteId,
        tipo: "SAIDA",
        quantidade: 0
      })
    ).rejects.toThrow(
      "A quantidade deve ser um número inteiro positivo."
    );

    expect(repository.registrar).not.toHaveBeenCalled();
  });

  // TESTE 5: Rejeitar quantidade negativa
  it("não deve aceitar quantidade negativa", async () => {

    const repository: RegistrarMovimentacaoRepository = {
      registrar: vi.fn()
    };

    const registrar = new RegistrarMovimentacao(repository);

    await expect(
      registrar.execute({
        loteId,
        tipo: "SAIDA",
        quantidade: -5
      })
    ).rejects.toThrow(
      "A quantidade deve ser um número inteiro positivo."
    );

    expect(repository.registrar).not.toHaveBeenCalled();
  });

  // TESTE 6: Rejeitar quantidade decimal
  it("não deve aceitar quantidade decimal", async () => {

    const repository: RegistrarMovimentacaoRepository = {
      registrar: vi.fn()
    };

    const registrar = new RegistrarMovimentacao(repository);

    await expect(
      registrar.execute({
        loteId,
        tipo: "ENTRADA",
        quantidade: 1.5
      })
    ).rejects.toThrow(
      "A quantidade deve ser um número inteiro positivo."
    );

    expect(repository.registrar).not.toHaveBeenCalled();
  });

  // TESTE 7: Rejeitar tipo inválido
  it("não deve aceitar tipo de movimentação inválido", async () => {

    const repository: RegistrarMovimentacaoRepository = {
      registrar: vi.fn()
    };

    const registrar = new RegistrarMovimentacao(repository);

    // Simular dados inválidos recebidos pela API
    const dadosInvalidos = {
      loteId,
      tipo: "TRANSFERENCIA",
      quantidade: 10
    } as unknown as RegistrarMovimentacaoDTO;

    await expect(
      registrar.execute(dadosInvalidos)
    ).rejects.toThrow(
      "O tipo deve ser ENTRADA ou SAIDA."
    );

    expect(repository.registrar).not.toHaveBeenCalled();
  });

});
