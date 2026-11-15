
import { describe, it, expect, vi } from "vitest";

import { ListarMedicamentos } from "../src/core/use-cases/ListarMedicamentos.js";

import type { MedicamentoRepository } from "../src/core/ports/MedicamentoRepository.js";

describe("FiltrarMedicamentos", () => {

  // Teste 1: Solicitar somente medicamentos ativos
  it("deve encaminhar o filtro true ao repositório", async () => {

    const medicamentoAtivo = {
      id: "1",
      nome: "Paracetamol 500 mg",
      principioAtivo: "Paracetamol",
      apresentacao: "Comprimido",
      ativo: true
    };

    const listar = vi.fn(async () => [medicamentoAtivo]);

    const repository: MedicamentoRepository = {
      listar
    };

    const listarMedicamentos = new ListarMedicamentos(repository);

    const resultado = await listarMedicamentos.execute(true);

    expect(listar).toHaveBeenCalledWith(true);
    expect(resultado).toEqual([medicamentoAtivo]);
  });

  // Teste 2: Solicitar somente medicamentos inativos
  it("deve encaminhar o filtro false ao repositório", async () => {

    const medicamentoInativo = {
      id: "2",
      nome: "Medicamento Teste Inativacao",
      principioAtivo: "Teste",
      apresentacao: "Comprimido",
      ativo: false
    };

    const listar = vi.fn(async () => [medicamentoInativo]);

    const repository: MedicamentoRepository = {
      listar
    };

    const listarMedicamentos = new ListarMedicamentos(repository);

    const resultado = await listarMedicamentos.execute(false);

    expect(listar).toHaveBeenCalledWith(false);
    expect(resultado).toEqual([medicamentoInativo]);
  });

});
