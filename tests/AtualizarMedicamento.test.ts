
import { describe, it, expect, vi } from "vitest";

import { AtualizarMedicamento } from "../src/core/use-cases/AtualizarMedicamento.js";

import type { AtualizarMedicamentoRepository } from "../src/core/ports/AtualizarMedicamentoRepository.js";

describe("AtualizarMedicamento", () => {

  // Teste 1: Atualização com dados válidos
  it("deve atualizar um medicamento com dados válidos", async () => {

    const repository: AtualizarMedicamentoRepository = {
      atualizar: vi.fn(async (id, dados) => ({
        id,
        ...dados,
        ativo: true
      }))
    };

    const atualizarMedicamento = new AtualizarMedicamento(
      repository
    );

    const resultado = await atualizarMedicamento.execute("1", {
      nome: "  Ibuprofeno 400 mg  ",
      principioAtivo: "Ibuprofeno",
      apresentacao: "Comprimido"
    });

    expect(resultado?.nome).toBe("Ibuprofeno 400 mg");

    expect(repository.atualizar).toHaveBeenCalledWith(
      "1",
      {
        nome: "Ibuprofeno 400 mg",
        principioAtivo: "Ibuprofeno",
        apresentacao: "Comprimido"
      }
    );
  });

  // Teste 2: Nome vazio
  it("não deve atualizar medicamento com nome vazio", async () => {

    const repository: AtualizarMedicamentoRepository = {
      atualizar: vi.fn()
    };

    const atualizarMedicamento = new AtualizarMedicamento(
      repository
    );

    await expect(
      atualizarMedicamento.execute("1", {
        nome: "",
        principioAtivo: "Ibuprofeno",
        apresentacao: "Comprimido"
      })
    ).rejects.toThrow("Todos os campos devem ser preenchidos.");

    expect(repository.atualizar).not.toHaveBeenCalled();
  });

  // Teste 3: Medicamento inexistente
  it("deve retornar null quando o medicamento não existir", async () => {

    const repository: AtualizarMedicamentoRepository = {
      atualizar: vi.fn(async () => null)
    };

    const atualizarMedicamento = new AtualizarMedicamento(
      repository
    );

    const resultado = await atualizarMedicamento.execute("999", {
      nome: "Paracetamol 500 mg",
      principioAtivo: "Paracetamol",
      apresentacao: "Comprimido"
    });

    expect(resultado).toBeNull();

    expect(repository.atualizar).toHaveBeenCalledOnce();
  });

});
