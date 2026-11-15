
import { describe, it, expect } from "vitest";

import { ListarMedicamentos } from "../src/core/use-cases/ListarMedicamentos.js";

import { InMemoryMedicamentoRepository } from "../src/infra/database/InMemoryMedicamentoRepository.js";

describe("ListarMedicamentos", () => {

  it("deve listar os medicamentos cadastrados em memória", async () => {

    // Preparar o repositório para o teste
    const repository = new InMemoryMedicamentoRepository();

    // Criar o caso de uso
    const listarMedicamentos = new ListarMedicamentos(repository);

    // Executar a listagem
    const medicamentos = await listarMedicamentos.execute();

    // Verificar o resultado
    expect(medicamentos).toHaveLength(2);

    expect(medicamentos[0].nome).toBe("Paracetamol 500 mg");

    expect(medicamentos[1].nome).toBe("Dipirona 500 mg");
  });

});
