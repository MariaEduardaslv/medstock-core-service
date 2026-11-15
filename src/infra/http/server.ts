
import express from "express";

import { pool } from "../database/postgres.js";

import { PostgresMedicamentoRepository } from "../database/PostgresMedicamentoRepository.js";

import { ListarMedicamentos } from "../../core/use-cases/ListarMedicamentos.js";

import { CriarMedicamento } from "../../core/use-cases/CriarMedicamento.js";

import { BuscarMedicamentoPorId } from "../../core/use-cases/BuscarMedicamentoPorId.js";

import { AtualizarMedicamento } from "../../core/use-cases/AtualizarMedicamento.js";

import { InativarMedicamento } from "../../core/use-cases/InativarMedicamento.js";

// Criar aplicação Express
export const app = express();

app.use(express.json());

// Criar repositório PostgreSQL
const medicamentoRepository = new PostgresMedicamentoRepository();

// Criar casos de uso
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

// Expressão para verificar o formato UUID

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;


// Rota para verificar o serviço
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "medstock-core-service"
  });
});


 // Rota para listar medicamentos com filtro opcional
app.get("/medicamentos", async (req, res, next) => {
  try {
    // Receber o filtro da URL
    const filtroAtivo = req.query.ativo;

    // Validar o valor informado
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

    // Converter o filtro de texto para boolean
    const ativo =
      filtroAtivo === undefined
        ? undefined
        : filtroAtivo === "true";

    // Executar o caso de uso
    const medicamentos = await listarMedicamentos.execute(ativo);

    // Retornar os medicamentos
    res.json(medicamentos);

  } catch (error) {
    next(error);
  }
});

// Rota para buscar medicamento pelo ID
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

// Rota para cadastrar medicamentos
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

// NOVA ROTA: Atualizar medicamento pelo ID
app.put("/medicamentos/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const dados = req.body;

    // Validar o UUID
    if (typeof id !== "string" || !uuidRegex.test(id)) {
      res.status(400).json({
        erro: "ID do medicamento inválido."
      });
      return;
    }

    // Validar os campos obrigatórios
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

    // Validar os limites dos campos
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

    // Executar o caso de uso
    const medicamento = await atualizarMedicamento.execute(
      id,
      dados
    );

    // Verificar se o medicamento existe
    if (!medicamento) {
      res.status(404).json({
        erro: "Medicamento não encontrado."
      });
      return;
    }

    // Retornar medicamento atualizado
    res.status(200).json(medicamento);

  } catch (error) {
    next(error);
  }
});

// Rota para verificar a conexão com PostgreSQL
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


 // Rota para inativar medicamento
app.patch("/medicamentos/:id/inativar", async (req, res, next) => {
  try {
    const id = req.params.id;

    // Validar o formato UUID
    if (typeof id !== "string" || !uuidRegex.test(id)) {
      res.status(400).json({
        erro: "ID do medicamento inválido."
      });
      return;
    }

    // Executar o caso de uso
    const sucesso = await inativarMedicamento.execute(id);

    // Verificar se o medicamento existe
    if (!sucesso) {
      res.status(404).json({
        erro: "Medicamento não encontrado."
      });
      return;
    }

    // Confirmar a inativação
    res.status(200).json({
      mensagem: "Medicamento inativado com sucesso.",
      id
    });

  } catch (error) {
    next(error);
  }
});

