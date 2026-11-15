
import { describe, it, expect, vi } from "vitest";

import { CriarMedicamento } from "../src/core/use-cases/CriarMedicamento.js";

import type { CriarMedicamentoRepository } from "../src/core/ports/CriarMedicamentoRepository.js";

describe("CriarMedicamento", () => {

  it("deve cadastrar um medicamento com dados válidos", async () => {

    // Simular o repositório
    const repository: CriarMedicamentoRepository = {
      criar: vi.fn(async (dados) => ({
        id: "1",
        ...dados,
        ativo: true
      }))
    };

    // Criar o caso de uso
    const criarMedicamento = new CriarMedicamento(repository);

    // Executar o cadastro
    const medicamento = await criarMedicamento.execute({
      nome: "  Paracetamol 500 mg  ",
      principioAtivo: "Paracetamol",
      apresentacao: "Comprimido"
    });

    // Verificar os resultados
    expect(medicamento.nome).toBe("Paracetamol 500 mg");

    expect(medicamento.ativo).toBe(true);

    expect(repository.criar).toHaveBeenCalledOnce();
  });

  it("não deve cadastrar medicamento com nome vazio", async () => {

    // Simular o repositório
    const repository: CriarMedicamentoRepository = {
      criar: vi.fn()
    };

    const criarMedicamento = new CriarMedicamento(repository);

    // Verificar se o cadastro é rejeitado
    await expect(
      criarMedicamento.execute({
        nome: "",
        principioAtivo: "Paracetamol",
        apresentacao: "Comprimido"
      })
    ).rejects.toThrow("Todos os campos devem ser preenchidos.");

    // Confirmar que o repositório não foi chamado
    expect(repository.criar).not.toHaveBeenCalled();
  });

});
