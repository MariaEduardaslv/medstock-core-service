
import { describe, it, expect, vi } from "vitest";

import { InativarMedicamento } from "../src/core/use-cases/InativarMedicamento.js";

import type { InativarMedicamentoRepository } from "../src/core/ports/InativarMedicamentoRepository.js";

describe("InativarMedicamento", () => {

  // Teste 1: Medicamento existente
  it("deve inativar um medicamento existente", async () => {

    const repository: InativarMedicamentoRepository = {
      inativar: vi.fn(async () => true)
    };

    const inativarMedicamento = new InativarMedicamento(
      repository
    );

    const resultado = await inativarMedicamento.execute("1");

    expect(resultado).toBe(true);

    expect(repository.inativar).toHaveBeenCalledWith("1");
  });

  // Teste 2: Medicamento inexistente
  it("deve retornar false quando o medicamento não existir", async () => {

    const repository: InativarMedicamentoRepository = {
      inativar: vi.fn(async () => false)
    };

    const inativarMedicamento = new InativarMedicamento(
      repository
    );

    const resultado = await inativarMedicamento.execute("999");

    expect(resultado).toBe(false);

    expect(repository.inativar).toHaveBeenCalledWith("999");
  });

  // Teste 3: ID vazio
  it("não deve inativar medicamento sem ID", async () => {

    const repository: InativarMedicamentoRepository = {
      inativar: vi.fn()
    };

    const inativarMedicamento = new InativarMedicamento(
      repository
    );

    await expect(
      inativarMedicamento.execute("")
    ).rejects.toThrow("O ID do medicamento é obrigatório.");

    expect(repository.inativar).not.toHaveBeenCalled();
  });

});
