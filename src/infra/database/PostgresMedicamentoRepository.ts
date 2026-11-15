
import type { Medicamento } from "../../core/domain/entities/Medicamento.js";

import type { MedicamentoRepository } from "../../core/ports/MedicamentoRepository.js";

import type { CriarMedicamentoRepository } from "../../core/ports/CriarMedicamentoRepository.js";

import type { BuscarMedicamentoPorIdRepository } from "../../core/ports/BuscarMedicamentoPorIdRepository.js";

import type { AtualizarMedicamentoRepository } from "../../core/ports/AtualizarMedicamentoRepository.js";

import type { InativarMedicamentoRepository } from "../../core/ports/InativarMedicamentoRepository.js";

import type { CriarMedicamentoDTO } from "../../core/dtos/CriarMedicamentoDTO.js";

import type { AtualizarMedicamentoDTO } from "../../core/dtos/AtualizarMedicamentoDTO.js";

import { pool } from "./postgres.js";

export class PostgresMedicamentoRepository
  implements
    MedicamentoRepository,
    CriarMedicamentoRepository,
    BuscarMedicamentoPorIdRepository,
    AtualizarMedicamentoRepository,
    InativarMedicamentoRepository {

  
  // 1. Listar medicamentos com filtro opcional
  async listar(ativo?: boolean): Promise<Medicamento[]> {

    const resultado = await pool.query<Medicamento>(
      `
      SELECT
        id,
        nome,
        principio_ativo AS "principioAtivo",
        apresentacao,
        ativo
      FROM medicamentos
      WHERE ($1::boolean IS NULL OR ativo = $1::boolean)
      ORDER BY nome
      `,
      [ativo ?? null]
    );

    return resultado.rows;
  }


  // 2. Cadastrar medicamento
  async criar(dados: CriarMedicamentoDTO): Promise<Medicamento> {
    const resultado = await pool.query<Medicamento>(
      `
      INSERT INTO medicamentos (
        nome,
        principio_ativo,
        apresentacao
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        nome,
        principio_ativo AS "principioAtivo",
        apresentacao,
        ativo
      `,
      [
        dados.nome,
        dados.principioAtivo,
        dados.apresentacao
      ]
    );

    const medicamento = resultado.rows[0];

    if (!medicamento) {
      throw new Error("Não foi possível cadastrar o medicamento.");
    }

    return medicamento;
  }

  // 3. Buscar medicamento pelo ID
  async buscarPorId(id: string): Promise<Medicamento | null> {
    const resultado = await pool.query<Medicamento>(
      `
      SELECT
        id,
        nome,
        principio_ativo AS "principioAtivo",
        apresentacao,
        ativo
      FROM medicamentos
      WHERE id = $1
      `,
      [id]
    );

    return resultado.rows[0] ?? null;
  }

  // 4. Atualizar medicamento
  async atualizar(
    id: string,
    dados: AtualizarMedicamentoDTO
  ): Promise<Medicamento | null> {
    const resultado = await pool.query<Medicamento>(
      `
      UPDATE medicamentos
      SET
        nome = $1,
        principio_ativo = $2,
        apresentacao = $3
      WHERE id = $4
      RETURNING
        id,
        nome,
        principio_ativo AS "principioAtivo",
        apresentacao,
        ativo
      `,
      [
        dados.nome,
        dados.principioAtivo,
        dados.apresentacao,
        id
      ]
    );

    return resultado.rows[0] ?? null;
  }

  // 5. Inativar medicamento
  async inativar(id: string): Promise<boolean> {
    const resultado = await pool.query(
      `
      UPDATE medicamentos
      SET ativo = FALSE
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    return (resultado.rowCount ?? 0) > 0;
  }
}
