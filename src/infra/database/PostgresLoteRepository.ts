
import { pool } from "./postgres.js";

import type { Lote } from "../../core/domain/entities/Lote.js";

import type { CriarLoteDTO } from "../../core/dtos/CriarLoteDTO.js";

import type { CriarLoteRepository } from "../../core/ports/CriarLoteRepository.js";

import type { ListarLotesRepository } from "../../core/ports/ListarLotesRepository.js";

export class PostgresLoteRepository
  implements CriarLoteRepository, ListarLotesRepository {

  // ======================================
  // CADASTRAR LOTE
  // ======================================

  async criar(dados: CriarLoteDTO): Promise<Lote> {

    const resultado = await pool.query<Lote>(
      `
      INSERT INTO lotes (
        medicamento_id,
        numero_lote,
        data_validade
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        medicamento_id AS "medicamentoId",
        numero_lote AS "numeroLote",
        TO_CHAR(data_validade, 'YYYY-MM-DD') AS "dataValidade",
        quantidade_atual AS "quantidadeAtual"
      `,
      [
        dados.medicamentoId,
        dados.numeroLote,
        dados.dataValidade
      ]
    );

    const lote = resultado.rows[0];

    if (!lote) {
      throw new Error("Não foi possível cadastrar o lote.");
    }

    return lote;
  }

  // ======================================
  // LISTAR LOTES POR MEDICAMENTO
  // ======================================

  async listarPorMedicamento(
    medicamentoId: string
  ): Promise<Lote[]> {

    const resultado = await pool.query<Lote>(
      `
      SELECT
        id,
        medicamento_id AS "medicamentoId",
        numero_lote AS "numeroLote",
        TO_CHAR(data_validade, 'YYYY-MM-DD') AS "dataValidade",
        quantidade_atual AS "quantidadeAtual"
      FROM lotes
      WHERE medicamento_id = $1
      ORDER BY data_validade ASC, numero_lote ASC
      `,
      [medicamentoId]
    );

    return resultado.rows;
  }
}
