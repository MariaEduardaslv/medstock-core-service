
import "dotenv/config";

import { randomUUID } from "node:crypto";

import {
  describe,
  it,
  expect,
  afterAll
} from "vitest";

import request from "supertest";

import { app } from "../src/infra/http/server.js";

import { pool } from "../src/infra/database/postgres.js";

// ======================================
// TESTE REAL DE CONCORRÊNCIA - MEDSTOCK
// ======================================

describe("Saída concorrente do último frasco", () => {

  afterAll(async () => {
    await pool.end();
  });

  it("deve permitir apenas uma saída da última unidade", async () => {

    let medicamentoId: string | undefined;
    let loteId: string | undefined;

    try {

      // ======================================
      // 1. CRIAR MEDICAMENTO DE TESTE
      // ======================================

      const respostaMedicamento = await request(app)
        .post("/medicamentos")
        .send({
          nome: `Medicamento Concorrencia ${randomUUID().slice(0, 8)}`,
          principioAtivo: "Teste",
          apresentacao: "Frasco"
        });

      expect(respostaMedicamento.status).toBe(201);

      medicamentoId = respostaMedicamento.body.id;

      // ======================================
      // 2. CRIAR LOTE EXCLUSIVO
      // ======================================

      const respostaLote = await request(app)
        .post("/lotes")
        .send({
          medicamentoId,
          numeroLote: `TESTE-${randomUUID().slice(0, 8)}`,
          dataValidade: "2030-12-31"
        });

      expect(respostaLote.status).toBe(201);

      loteId = respostaLote.body.id;

      // ======================================
      // 3. REGISTRAR ENTRADA DE 1 UNIDADE
      // ======================================

      const entrada = await request(app)
        .post("/movimentacoes-estoque")
        .send({
          loteId,
          tipo: "ENTRADA",
          quantidade: 1
        });

      expect(entrada.status).toBe(201);

      // ======================================
      // 4. ENVIAR DUAS SAÍDAS CONCORRENTES
      // ======================================

      const dadosSaida = {
        loteId,
        tipo: "SAIDA",
        quantidade: 1
      };

      const [respostaA, respostaB] = await Promise.all([
        request(app)
          .post("/movimentacoes-estoque")
          .send(dadosSaida),

        request(app)
          .post("/movimentacoes-estoque")
          .send(dadosSaida)
      ]);

      // ======================================
      // 5. VERIFICAR AS RESPOSTAS HTTP
      // ======================================

      const codigos = [
        respostaA.status,
        respostaB.status
      ].sort((a, b) => a - b);

      expect(codigos).toEqual([201, 409]);

      const respostaRecusada =
        respostaA.status === 409
          ? respostaA
          : respostaB;

      expect(respostaRecusada.body).toEqual({
        erro: "Estoque insuficiente para a saída."
      });

      // ======================================
      // 6. VERIFICAR O ESTOQUE REAL
      // ======================================

      const saldo = await pool.query<{
        quantidade_atual: number;
      }>(
        `
        SELECT quantidade_atual
        FROM lotes
        WHERE id = $1
        `,
        [loteId]
      );

      expect(saldo.rows[0]?.quantidade_atual).toBe(0);

      // ======================================
      // 7. VERIFICAR O HISTÓRICO REAL
      // ======================================

      const historico = await pool.query<{
        tipo: string;
        quantidade: number;
      }>(
        `
        SELECT tipo, quantidade
        FROM movimentacoes_estoque
        WHERE lote_id = $1
        `,
        [loteId]
      );

      const entradas = historico.rows.filter(
        (mov) => mov.tipo === "ENTRADA"
      );

      const saidas = historico.rows.filter(
        (mov) => mov.tipo === "SAIDA"
      );

      expect(entradas).toHaveLength(1);
      expect(saidas).toHaveLength(1);

      expect(entradas[0]?.quantidade).toBe(1);
      expect(saidas[0]?.quantidade).toBe(1);

      // ======================================
      // 8. MOSTRAR RESULTADOS
      // ======================================

      console.log("RESULTADO DO TESTE DE CONCORRÊNCIA");

      console.log(
        "Solicitação A:",
        respostaA.status
      );

      console.log(
        "Solicitação B:",
        respostaB.status
      );

      console.log(
        "Estoque final:",
        saldo.rows[0]?.quantidade_atual
      );

      console.log(
        "Saídas registradas:",
        saidas.length
      );

    } finally {

      // ======================================
      // 9. LIMPAR OS DADOS DO TESTE
      // ======================================

      if (loteId) {

        await pool.query(
          `
          DELETE FROM movimentacoes_estoque
          WHERE lote_id = $1
          `,
          [loteId]
        );

        await pool.query(
          `
          DELETE FROM lotes
          WHERE id = $1
          `,
          [loteId]
        );
      }

      if (medicamentoId) {

        await pool.query(
          `
          DELETE FROM medicamentos
          WHERE id = $1
          `,
          [medicamentoId]
        );
      }
    }
  });
});
