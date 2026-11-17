
import express from "express";

import { pool } from "../database/postgres.js";

import { PostgresMedicamentoRepository } from "../database/PostgresMedicamentoRepository.js";

import { ListarMedicamentos } from "../../core/use-cases/ListarMedicamentos.js";
import { CriarMedicamento } from "../../core/use-cases/CriarMedicamento.js";
import { BuscarMedicamentoPorId } from "../../core/use-cases/BuscarMedicamentoPorId.js";
import { AtualizarMedicamento } from "../../core/use-cases/AtualizarMedicamento.js";
import { InativarMedicamento } from "../../core/use-cases/InativarMedicamento.js";

import { CriarLote } from "../../core/use-cases/CriarLote.js";
import { ListarLotes } from "../../core/use-cases/ListarLotes.js";
import { PostgresLoteRepository } from "../database/PostgresLoteRepository.js";

import { RegistrarMovimentacao } from "../../core/use-cases/RegistrarMovimentacao.js";

import { PostgresMovimentacaoRepository } from "../database/PostgresMovimentacaoRepository.js";


// ======================================
// CONFIGURAÇÃO DO EXPRESS
// ======================================

export const app = express();

app.use(express.json());

// ======================================
// REPOSITÓRIOS
// ======================================

const medicamentoRepository = new PostgresMedicamentoRepository();

const loteRepository = new PostgresLoteRepository();

// ======================================
// CASOS DE USO
// ======================================

const listarMedicamentos = new ListarMedicamentos(
  medicamentoRepository
);

const criarMedicamento = new CriarMedicamento(
  medicamentoRepository
);

const buscarMedicamentoPorId = new BuscarMedicamentoPorId(
  medicamentoRepository
);

const atualizarMedicamento = new AtualizarMedicamento(
  medicamentoRepository
);

const inativarMedicamento = new InativarMedicamento(
  medicamentoRepository
);

const criarLote = new CriarLote(loteRepository);

const listarLotes = new ListarLotes(loteRepository);

// Repositório de movimentações
const movimentacaoRepository =
  new PostgresMovimentacaoRepository();

// Caso de uso de movimentações
const registrarMovimentacao =
  new RegistrarMovimentacao(movimentacaoRepository);


// ======================================
// VALIDAÇÃO UUID
// ======================================

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ======================================
// VERIFICAÇÃO DO SERVIÇO
// ======================================

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "medstock-core-service"
  });
});

// ======================================
// LISTAR MEDICAMENTOS
// GET /medicamentos
// ======================================

app.get("/medicamentos", async (req, res, next) => {
  try {
    const filtroAtivo = req.query.ativo;

    if (
      filtroAtivo !== undefined &&
      filtroAtivo !== "true" &&
      filtroAtivo !== "false"
    ) {
      res.status(400).json({
        erro: "O filtro ativo deve ser true ou false."
      });
      return;
    }

    const ativo =
      filtroAtivo === undefined
        ? undefined
        : filtroAtivo === "true";

    const medicamentos = await listarMedicamentos.execute(ativo);

    res.json(medicamentos);

  } catch (error) {
    next(error);
  }
});

// ======================================
// BUSCAR MEDICAMENTO POR ID
// GET /medicamentos/:id
// ======================================

app.get("/medicamentos/:id", async (req, res, next) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string" || !uuidRegex.test(id)) {
      res.status(400).json({
        erro: "ID do medicamento inválido."
      });
      return;
    }

    const medicamento = await buscarMedicamentoPorId.execute(id);

    if (!medicamento) {
      res.status(404).json({
        erro: "Medicamento não encontrado."
      });
      return;
    }

    res.json(medicamento);

  } catch (error) {
    next(error);
  }
});

// ======================================
// CADASTRAR MEDICAMENTO
// POST /medicamentos
// ======================================

app.post("/medicamentos", async (req, res, next) => {
  try {
    const dados = req.body;

    if (
      !dados ||
      typeof dados !== "object" ||
      Array.isArray(dados) ||
      typeof dados.nome !== "string" ||
      typeof dados.principioAtivo !== "string" ||
      typeof dados.apresentacao !== "string" ||
      !dados.nome.trim() ||
      !dados.principioAtivo.trim() ||
      !dados.apresentacao.trim()
    ) {
      res.status(400).json({
        erro: "Nome, princípio ativo e apresentação são obrigatórios."
      });
      return;
    }

    if (
      dados.nome.trim().length > 150 ||
      dados.principioAtivo.trim().length > 150 ||
      dados.apresentacao.trim().length > 100
    ) {
      res.status(400).json({
        erro: "Um ou mais campos ultrapassam o tamanho permitido."
      });
      return;
    }

    const medicamento = await criarMedicamento.execute(dados);

    res.status(201).json(medicamento);

  } catch (error) {
    next(error);
  }
});

// ======================================
// ATUALIZAR MEDICAMENTO
// PUT /medicamentos/:id
// ======================================

app.put("/medicamentos/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const dados = req.body;

    if (typeof id !== "string" || !uuidRegex.test(id)) {
      res.status(400).json({
        erro: "ID do medicamento inválido."
      });
      return;
    }

    if (
      !dados ||
      typeof dados !== "object" ||
      Array.isArray(dados) ||
      typeof dados.nome !== "string" ||
      typeof dados.principioAtivo !== "string" ||
      typeof dados.apresentacao !== "string" ||
      !dados.nome.trim() ||
      !dados.principioAtivo.trim() ||
      !dados.apresentacao.trim()
    ) {
      res.status(400).json({
        erro: "Todos os campos são obrigatórios."
      });
      return;
    }

    if (
      dados.nome.trim().length > 150 ||
      dados.principioAtivo.trim().length > 150 ||
      dados.apresentacao.trim().length > 100
    ) {
      res.status(400).json({
        erro: "Um ou mais campos ultrapassam o tamanho permitido."
      });
      return;
    }

    const medicamento = await atualizarMedicamento.execute(
      id,
      dados
    );

    if (!medicamento) {
      res.status(404).json({
        erro: "Medicamento não encontrado."
      });
      return;
    }

    res.status(200).json(medicamento);

  } catch (error) {
    next(error);
  }
});

// ======================================
// VERIFICAR CONEXÃO COM POSTGRESQL
// GET /health/database
// ======================================

app.get("/health/database", async (_req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT current_database() AS nome"
    );

    res.json({
      status: "ok",
      database: resultado.rows[0].nome
    });

  } catch (error) {
    console.error("Erro de conexão com PostgreSQL:", error);

    res.status(503).json({
      status: "erro",
      database: "indisponivel"
    });
  }
});

// ======================================
// INATIVAR MEDICAMENTO
// PATCH /medicamentos/:id/inativar
// ======================================

app.patch("/medicamentos/:id/inativar", async (req, res, next) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string" || !uuidRegex.test(id)) {
      res.status(400).json({
        erro: "ID do medicamento inválido."
      });
      return;
    }

    const sucesso = await inativarMedicamento.execute(id);

    if (!sucesso) {
      res.status(404).json({
        erro: "Medicamento não encontrado."
      });
      return;
    }

    res.status(200).json({
      mensagem: "Medicamento inativado com sucesso.",
      id
    });

  } catch (error) {
    next(error);
  }
});

// ======================================
// CADASTRAR LOTE
// POST /lotes
// ======================================

app.post("/lotes", async (req, res) => {
  try {
    const dados = req.body;

    if (
      !dados ||
      typeof dados !== "object" ||
      Array.isArray(dados)
    ) {
      res.status(400).json({
        erro: "Todos os campos do lote são obrigatórios."
      });
      return;
    }

    // Validar identificador do medicamento
    if (
      typeof dados.medicamentoId === "string" &&
      dados.medicamentoId.trim()
    ) {
      if (!uuidRegex.test(dados.medicamentoId.trim())) {
        res.status(400).json({
          erro: "ID do medicamento inválido."
        });
        return;
      }
    }

    // Validar tamanho do número do lote
    if (
      typeof dados.numeroLote === "string" &&
      dados.numeroLote.trim().length > 100
    ) {
      res.status(400).json({
        erro: "O número do lote ultrapassa o tamanho permitido."
      });
      return;
    }

    const lote = await criarLote.execute(dados);

    res.status(201).json(lote);

  } catch (erro) {

    const codigo =
      typeof erro === "object" &&
      erro !== null &&
      "code" in erro
        ? erro.code
        : undefined;

    // Medicamento inexistente
    if (codigo === "23503") {
      res.status(404).json({
        erro: "Medicamento não encontrado."
      });
      return;
    }

    // Lote duplicado
    if (codigo === "23505") {
      res.status(409).json({
        erro: "Este número de lote já existe para o medicamento."
      });
      return;
    }

    // Erros de validação
    if (
      erro instanceof Error &&
      [
        "Todos os campos do lote são obrigatórios.",
        "Data de validade inválida. Use AAAA-MM-DD.",
        "Data de validade inválida."
      ].includes(erro.message)
    ) {
      res.status(400).json({
        erro: erro.message
      });
      return;
    }

    console.error("Erro ao cadastrar lote:", erro);

    res.status(500).json({
      erro: "Erro interno ao cadastrar lote."
    });
  }
});


// ======================================
// REGISTRAR MOVIMENTAÇÃO DE ESTOQUE
// POST /movimentacoes-estoque
// ======================================

app.post("/movimentacoes-estoque", async (req, res) => {
  try {
    const dados = req.body;

    // Validar o corpo da requisição
    if (
      !dados ||
      typeof dados !== "object" ||
      Array.isArray(dados)
    ) {
      res.status(400).json({
        erro: "Os dados da movimentação são obrigatórios."
      });
      return;
    }

    // Validar o formato UUID do lote
    if (
      typeof dados.loteId === "string" &&
      dados.loteId.trim() &&
      !uuidRegex.test(dados.loteId.trim())
    ) {
      res.status(400).json({
        erro: "ID do lote inválido."
      });
      return;
    }

    // Executar o caso de uso
    const movimentacao =
      await registrarMovimentacao.execute(dados);

    // Retornar a movimentação registrada
    res.status(201).json(movimentacao);

  } catch (erro) {

    // Lote inexistente
    if (
      erro instanceof Error &&
      erro.message === "Lote não encontrado."
    ) {
      res.status(404).json({
        erro: erro.message
      });
      return;
    }

    // Estoque insuficiente
    if (
      erro instanceof Error &&
      erro.message === "Estoque insuficiente para a saída."
    ) {
      res.status(409).json({
        erro: erro.message
      });
      return;
    }

    // Erros de validação
    if (
      erro instanceof Error &&
      [
        "Os dados da movimentação são obrigatórios.",
        "ID do lote é obrigatório.",
        "O tipo deve ser ENTRADA ou SAIDA.",
        "A quantidade deve ser um número inteiro positivo."
      ].includes(erro.message)
    ) {
      res.status(400).json({
        erro: erro.message
      });
      return;
    }

    // Tratar erros inesperados
    console.error("Erro ao registrar movimentação:", erro);

    res.status(500).json({
      erro: "Erro interno ao registrar movimentação."
    });
  }
});


// ======================================
// CONSULTAR LOTES DE UM MEDICAMENTO
// GET /medicamentos/:id/lotes
// ======================================

app.get("/medicamentos/:id/lotes", async (req, res, next) => {
  try {
    const id = req.params.id;

    // Validar o identificador do medicamento
    if (typeof id !== "string" || !uuidRegex.test(id)) {
      res.status(400).json({
        erro: "ID do medicamento inválido."
      });
      return;
    }

    // Verificar se o medicamento existe
    const medicamento = await buscarMedicamentoPorId.execute(id);

    if (!medicamento) {
      res.status(404).json({
        erro: "Medicamento não encontrado."
      });
      return;
    }

    // Buscar os lotes cadastrados
    const lotes = await listarLotes.execute(id);

    // Retornar os lotes
    res.status(200).json(lotes);

  } catch (error) {
    next(error);
  }
});
