
import { describe, it, expect, vi } from "vitest";

import { BuscarMedicamentoPorId } from "../src/core/use-cases/BuscarMedicamentoPorId.js";

import type { BuscarMedicamentoPorIdRepository } from "../src/core/ports/BuscarMedicamentoPorIdRepository.js";

describe("BuscarMedicamentoPorId", () => {

  // Teste 1: Medicamento encontrado
  it("deve retornar o medicamento quando o ID existir", async () => {

    const medicamento = {
      id: "1",
      nome: "Paracetamol 500 mg",
      principioAtivo: "Paracetamol",
      apresentacao: "Comprimido",
      ativo: true
    };

    // Simular o repositório
    const repository: BuscarMedicamentoPorIdRepository = {
      buscarPorId: vi.fn(async () => medicamento)
    };

    // Criar o caso de uso
    const buscarMedicamento = new BuscarMedicamentoPorId(
      repository
    );

    // Executar a busca
    const resultado = await buscarMedicamento.execute("1");

    // Verificar o resultado
    expect(resultado).toEqual(medicamento);

    expect(repository.buscarPorId).toHaveBeenCalledWith("1");
  });

  // Teste 2: Medicamento inexistente
  it("deve retornar null quando o medicamento não existir", async () => {

    // Simular um repositório sem o medicamento
    const repository: BuscarMedicamentoPorIdRepository = {
      buscarPorId: vi.fn(async () => null)
    };

    const buscarMedicamento = new BuscarMedicamentoPorId(
      repository
    );

    // Executar a busca
    const resultado = await buscarMedicamento.execute("999");

    // Verificar o resultado
    expect(resultado).toBeNull();

    expect(repository.buscarPorId).toHaveBeenCalledWith("999");
  });

});
