
import {
  describe,
  it,
  expect,
  vi,
  beforeEach
} from "vitest";

import request from "supertest";

// Simular o PostgreSQL
const queryMock = vi.hoisted(() => vi.fn());

vi.mock("../src/infra/database/postgres.js", () => ({
  pool: {
    query: queryMock
  }
}));

import { app } from "../src/infra/http/server.js";

describe("API HTTP de Lotes", () => {

  // Limpar a simulação antes de cada teste
  beforeEach(() => {
    queryMock.mockReset();
  });

  const medicamentoId =
    "13c0d62e-381d-49cd-9a16-57b875b07065";

  // TESTE 1: Cadastrar lote com sucesso
  it("deve cadastrar lote e retornar status 201", async () => {

    const lote = {
      id: "ad61979d-3bc1-4e0e-8a95-20606ef0f763",
      medicamentoId,
      numeroLote: "LOT-AUTOMATICO-001",
      dataValidade: "2027-05-10",
      quantidadeAtual: 0
    };

    // Simular cadastro no PostgreSQL
    queryMock.mockResolvedValueOnce({
      rows: [lote],
      rowCount: 1
    });

    const resposta = await request(app)
      .post("/lotes")
      .send({
        medicamentoId,
        numeroLote: " LOT-AUTOMATICO-001 ",
        dataValidade: "2027-05-10"
      });

    expect(resposta.status).toBe(201);

    expect(resposta.body).toEqual(lote);

    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO lotes"),
      [
        medicamentoId,
        "LOT-AUTOMATICO-001",
        "2027-05-10"
      ]
    );
  });

  // TESTE 2: Impedir lote duplicado
  it("deve retornar 409 para lote duplicado", async () => {

    // Simular erro de chave única do PostgreSQL
    const erroDuplicado = Object.assign(
      new Error("Lote duplicado"),
      { code: "23505" }
    );

    queryMock.mockRejectedValueOnce(erroDuplicado);

    const resposta = await request(app)
      .post("/lotes")
      .send({
        medicamentoId,
        numeroLote: "LOT-AUTOMATICO-001",
        dataValidade: "2027-05-10"
      });

    expect(resposta.status).toBe(409);

    expect(resposta.body).toEqual({
      erro: "Este número de lote já existe para o medicamento."
    });
  });

  // TESTE 3: Medicamento inexistente
  it("deve retornar 404 para medicamento inexistente", async () => {

    // Simular erro de chave estrangeira
    const erroMedicamento = Object.assign(
      new Error("Medicamento inexistente"),
      { code: "23503" }
    );

    queryMock.mockRejectedValueOnce(erroMedicamento);

    const resposta = await request(app)
      .post("/lotes")
      .send({
        medicamentoId:
          "99999999-9999-4999-8999-999999999999",
        numeroLote: "LOT-AUTOMATICO-002",
        dataValidade: "2027-08-20"
      });

    expect(resposta.status).toBe(404);

    expect(resposta.body).toEqual({
      erro: "Medicamento não encontrado."
    });
  });

  // TESTE 4: Consultar lotes com sucesso
  it("deve listar os lotes e retornar status 200", async () => {

    const medicamentoId =
      "13c0d62e-381d-49cd-9a16-57b875b07065";

    const medicamento = {
      id: medicamentoId,
      nome: "Ibuprofeno 400 mg",
      principioAtivo: "Ibuprofeno",
      apresentacao: "Comprimido",
      ativo: true
    };

    const lotes = [
      {
        id: "ad61979d-3bc1-4e0e-8a95-20606ef0f763",
        medicamentoId,
        numeroLote: "TESTE-LOT-001",
        dataValidade: "2027-05-10",
        quantidadeAtual: 0
      }
    ];

    // Primeira consulta: encontrar o medicamento
    queryMock.mockResolvedValueOnce({
      rows: [medicamento],
      rowCount: 1
    });

    // Segunda consulta: encontrar seus lotes
    queryMock.mockResolvedValueOnce({
      rows: lotes,
      rowCount: 1
    });

    const resposta = await request(app)
      .get(`/medicamentos/${medicamentoId}/lotes`);

    expect(resposta.status).toBe(200);

    expect(resposta.body).toEqual(lotes);

    // Verificar as duas consultas SQL
    expect(queryMock).toHaveBeenCalledTimes(2);

    expect(queryMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("FROM medicamentos"),
      [medicamentoId]
    );

    expect(queryMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("FROM lotes"),
      [medicamentoId]
    );
  });

  // TESTE 5: Identificador inválido
  it("deve retornar 400 para ID inválido", async () => {

    const resposta = await request(app)
      .get("/medicamentos/123/lotes");

    expect(resposta.status).toBe(400);

    expect(resposta.body).toEqual({
      erro: "ID do medicamento inválido."
    });

    // Não deve consultar o banco
    expect(queryMock).not.toHaveBeenCalled();
  });

  // TESTE 6: Medicamento inexistente
  it("deve retornar 404 para medicamento inexistente", async () => {

    const medicamentoId =
      "99999999-9999-4999-8999-999999999999";

    // Simular medicamento não encontrado
    queryMock.mockResolvedValueOnce({
      rows: [],
      rowCount: 0
    });

    const resposta = await request(app)
      .get(`/medicamentos/${medicamentoId}/lotes`);

    expect(resposta.status).toBe(404);

    expect(resposta.body).toEqual({
      erro: "Medicamento não encontrado."
    });

    // Apenas a busca do medicamento deve acontecer
    expect(queryMock).toHaveBeenCalledTimes(1);
  });


});
