
import { pool } from "./postgres.js";

import type {
  MovimentacaoEstoque
} from "../../core/domain/entities/MovimentacaoEstoque.js";

import type {
  RegistrarMovimentacaoDTO
} from "../../core/dtos/RegistrarMovimentacaoDTO.js";

import type {
  RegistrarMovimentacaoRepository
} from "../../core/ports/RegistrarMovimentacaoRepository.js";

export class PostgresMovimentacaoRepository
  implements RegistrarMovimentacaoRepository {

  async registrar(
    dados: RegistrarMovimentacaoDTO
  ): Promise<MovimentacaoEstoque> {

    // Reservar uma conexão exclusiva para a transação
    const client = await pool.connect();

    try {

      // Iniciar a transação
      await client.query("BEGIN");

      // Escolher a operação de estoque
      const sqlAtualizacao =
        dados.tipo === "ENTRADA"
          ? `
            UPDATE lotes
            SET quantidade_atual = quantidade_atual + $2
            WHERE id = $1
            RETURNING id
          `
          : `
            UPDATE lotes
            SET quantidade_atual = quantidade_atual - $2
            WHERE id = $1
              AND quantidade_atual >= $2
            RETURNING id
          `;

      // Executar a atualização
      const atualizacao = await client.query(
        sqlAtualizacao,
        [dados.loteId, dados.quantidade]
      );

      // Verificar se o estoque foi atualizado
      if (atualizacao.rowCount === 0) {

        const lote = await client.query(
          "SELECT id FROM lotes WHERE id = $1",
          [dados.loteId]
        );

        // Lote inexistente
        if (lote.rowCount === 0) {
          throw new Error("Lote não encontrado.");
        }

        // Lote existente, mas sem saldo suficiente
        throw new Error(
          "Estoque insuficiente para a saída."
        );
      }

      // Registrar a movimentação no histórico
      const resultado = await client.query<MovimentacaoEstoque>(
        `
        INSERT INTO movimentacoes_estoque (
          lote_id,
          tipo,
          quantidade
        )
        VALUES ($1, $2, $3)
        RETURNING
          id,
          lote_id AS "loteId",
          tipo,
          quantidade,
          TO_CHAR(
            criada_em AT TIME ZONE 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
          ) AS "criadaEm"
        `,
        [
          dados.loteId,
          dados.tipo,
          dados.quantidade
        ]
      );

      const movimentacao = resultado.rows[0];

      if (!movimentacao) {
        throw new Error(
          "Não foi possível registrar a movimentação."
        );
      }

      // Confirmar as duas operações juntas
      await client.query("COMMIT");

      return movimentacao;

    } catch (erro) {

      // Desfazer alterações caso ocorra algum erro
      await client.query("ROLLBACK");

      throw erro;

    } finally {

      // Liberar a conexão para outras operações
      client.release();
    }
  }
}
