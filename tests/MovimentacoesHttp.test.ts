
import {
  describe,
  it,
  expect,
  vi,
  beforeEach
} from "vitest";

import request from "supertest";

// Simular a conexão com PostgreSQL
const { connectMock, queryMock, releaseMock } = vi.hoisted(() => ({
  connectMock: vi.fn(),
  queryMock: vi.fn(),
  releaseMock: vi.fn()
}));

vi.mock("../src/infra/database/postgres.js", () => ({
  pool: {
    query: queryMock,
    connect: connectMock
  }
}));

import { app } from "../src/infra/http/server.js";

describe("API HTTP de Movimentações", () => {

  const loteId =
    "b4c400d3-4196-4411-8876-f76662b75767";

  beforeEach(() => {
    connectMock.mockReset();
    queryMock.mockReset();
    releaseMock.mockReset();

    connectMock.mockResolvedValue({
      query: queryMock,
      release: releaseMock
    });
  });

  // TESTE 1: Entrada bem-sucedida
  it("deve registrar entrada e retornar 201", async () => {

    const movimentacao = {
      id: "mov-1",
      loteId,
      tipo: "ENTRADA",
      quantidade: 10,
      criadaEm: "2026-11-16T23:00:00Z"
    };

    // BEGIN
    queryMock.mockResolvedValueOnce({});

    // UPDATE
    queryMock.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: loteId }]
    });

    // INSERT
    queryMock.mockResolvedValueOnce({
      rowCount: 1,
      rows: [movimentacao]
    });

    // COMMIT
    queryMock.mockResolvedValueOnce({});

    const resposta = await request(app)
      .post("/movimentacoes-estoque")
      .send({
        loteId,
        tipo: "ENTRADA",
        quantidade: 10
      });

    expect(resposta.status).toBe(201);
    expect(resposta.body).toEqual(movimentacao);

    expect(queryMock).toHaveBeenCalledWith("COMMIT");
    expect(releaseMock).toHaveBeenCalledOnce();
  });

  // TESTE 2: Estoque insuficiente
  it("deve retornar 409 quando não houver estoque", async () => {

    // BEGIN
    queryMock.mockResolvedValueOnce({});

    // UPDATE sem saldo suficiente
    queryMock.mockResolvedValueOnce({
      rowCount: 0,
      rows: []
    });

    // Lote existente
    queryMock.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: loteId }]
    });

    // ROLLBACK
    queryMock.mockResolvedValueOnce({});

    const resposta = await request(app)
      .post("/movimentacoes-estoque")
      .send({
        loteId,
        tipo: "SAIDA",
        quantidade: 1
      });

    expect(resposta.status).toBe(409);

    expect(resposta.body).toEqual({
      erro: "Estoque insuficiente para a saída."
    });

    expect(queryMock).toHaveBeenCalledWith("ROLLBACK");
    expect(queryMock).not.toHaveBeenCalledWith("COMMIT");
  });

  // TESTE 3: Quantidade inválida
  it("deve rejeitar quantidade zero com status 400", async () => {

    const resposta = await request(app)
      .post("/movimentacoes-estoque")
      .send({
        loteId,
        tipo: "SAIDA",
        quantidade: 0
      });

    expect(resposta.status).toBe(400);

    expect(resposta.body).toEqual({
      erro: "A quantidade deve ser um número inteiro positivo."
    });

    // Nenhuma conexão deve ser solicitada
    expect(connectMock).not.toHaveBeenCalled();
  });

});
