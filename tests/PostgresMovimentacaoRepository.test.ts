
import {
  describe,
  it,
  expect,
  vi,
  beforeEach
} from "vitest";

import { PostgresMovimentacaoRepository } from "../src/infra/database/PostgresMovimentacaoRepository.js";

// Simular a conexão e as consultas ao PostgreSQL
const {
  connectMock,
  queryMock,
  releaseMock
} = vi.hoisted(() => ({
  connectMock: vi.fn(),
  queryMock: vi.fn(),
  releaseMock: vi.fn()
}));

vi.mock("../src/infra/database/postgres.js", () => ({
  pool: {
    connect: connectMock
  }
}));

describe("PostgresMovimentacaoRepository", () => {

  const loteId =
    "ad61979d-3bc1-4e0e-8a95-20606ef0f763";

  beforeEach(() => {
    connectMock.mockReset();
    queryMock.mockReset();
    releaseMock.mockReset();

    connectMock.mockResolvedValue({
      query: queryMock,
      release: releaseMock
    });
  });

  // TESTE 1: Entrada de estoque
  it("deve registrar entrada e confirmar a transação", async () => {

    const movimentacao = {
      id: "mov-1",
      loteId,
      tipo: "ENTRADA" as const,
      quantidade: 100,
      criadaEm: "2026-11-15T12:00:00Z"
    };

    // BEGIN
    queryMock.mockResolvedValueOnce({});

    // UPDATE do lote
    queryMock.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: loteId }]
    });

    // INSERT da movimentação
    queryMock.mockResolvedValueOnce({
      rowCount: 1,
      rows: [movimentacao]
    });

    // COMMIT
    queryMock.mockResolvedValueOnce({});

    const repository = new PostgresMovimentacaoRepository();

    const resultado = await repository.registrar({
      loteId,
      tipo: "ENTRADA",
      quantidade: 100
    });

    expect(resultado).toEqual(movimentacao);

    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining(
        "quantidade_atual = quantidade_atual + $2"
      ),
      [loteId, 100]
    );

    expect(queryMock).toHaveBeenCalledWith("COMMIT");

    expect(releaseMock).toHaveBeenCalledOnce();
  });

  // TESTE 2: Saída de estoque
  it("deve registrar saída e confirmar a transação", async () => {

    const movimentacao = {
      id: "mov-2",
      loteId,
      tipo: "SAIDA" as const,
      quantidade: 1,
      criadaEm: "2026-11-15T12:00:00Z"
    };

    // BEGIN
    queryMock.mockResolvedValueOnce({});

    // UPDATE do lote
    queryMock.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: loteId }]
    });

    // INSERT da movimentação
    queryMock.mockResolvedValueOnce({
      rowCount: 1,
      rows: [movimentacao]
    });

    // COMMIT
    queryMock.mockResolvedValueOnce({});

    const repository = new PostgresMovimentacaoRepository();

    const resultado = await repository.registrar({
      loteId,
      tipo: "SAIDA",
      quantidade: 1
    });

    expect(resultado.tipo).toBe("SAIDA");

    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining(
        "quantidade_atual = quantidade_atual - $2"
      ),
      [loteId, 1]
    );

    expect(queryMock).toHaveBeenCalledWith("COMMIT");

    expect(releaseMock).toHaveBeenCalledOnce();
  });

  // TESTE 3: Estoque insuficiente
  it("deve rejeitar saída sem estoque e desfazer a transação", async () => {

    // BEGIN
    queryMock.mockResolvedValueOnce({});

    // UPDATE não encontra saldo suficiente
    queryMock.mockResolvedValueOnce({
      rowCount: 0,
      rows: []
    });

    // O lote existe
    queryMock.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: loteId }]
    });

    // ROLLBACK
    queryMock.mockResolvedValueOnce({});

    const repository = new PostgresMovimentacaoRepository();

    await expect(
      repository.registrar({
        loteId,
        tipo: "SAIDA",
        quantidade: 1
      })
    ).rejects.toThrow(
      "Estoque insuficiente para a saída."
    );

    expect(queryMock).toHaveBeenCalledWith("ROLLBACK");

    expect(queryMock).not.toHaveBeenCalledWith("COMMIT");

    // Verificar que não houve INSERT
    const executouInsert = queryMock.mock.calls.some(
      ([sql]) =>
        typeof sql === "string" &&
        sql.includes("INSERT INTO movimentacoes_estoque")
    );

    expect(executouInsert).toBe(false);

    expect(releaseMock).toHaveBeenCalledOnce();
  });

});
