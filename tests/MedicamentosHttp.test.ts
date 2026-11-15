
import { describe, it, expect, vi } from "vitest";

import request from "supertest";

// Simular a conexão com PostgreSQL
// para não acessar o banco real durante estes testes

const queryMock = vi.hoisted(() => vi.fn());

vi.mock("../src/infra/database/postgres.js", () => ({
  pool: {
    query: queryMock
  }
}));


import { app } from "../src/infra/http/server.js";

describe("API HTTP do MedStock", () => {

  // Teste 1: Verificar se a API responde
  it("deve retornar status 200 na rota /health", async () => {
    const resposta = await request(app).get("/health");

    expect(resposta.status).toBe(200);

    expect(resposta.body).toEqual({
      status: "ok",
      service: "medstock-core-service"
    });
  });

  // Teste 2: Verificar filtro inválido
  it("deve rejeitar um filtro ativo inválido", async () => {
    const resposta = await request(app)
      .get("/medicamentos?ativo=teste");

    expect(resposta.status).toBe(400);

    expect(resposta.body).toEqual({
      erro: "O filtro ativo deve ser true ou false."
    });
  });

  // Teste 3: Verificar UUID inválido
  it("deve rejeitar um ID de medicamento inválido", async () => {
    const resposta = await request(app)
      .get("/medicamentos/123");

    expect(resposta.status).toBe(400);

    expect(resposta.body).toEqual({
      erro: "ID do medicamento inválido."
    });
  });
   
  // Teste 4: Cadastro com nome vazio
  it("deve rejeitar cadastro de medicamento sem nome", async () => {
    const resposta = await request(app)
      .post("/medicamentos")
      .send({
        nome: "",
        principioAtivo: "Paracetamol",
        apresentacao: "Comprimido"
      });

    expect(resposta.status).toBe(400);

    expect(resposta.body).toEqual({
      erro: "Nome, princípio ativo e apresentação são obrigatórios."
    });
  });

  // Teste 5: Atualização com nome vazio
  it("deve rejeitar atualização com nome vazio", async () => {
    const resposta = await request(app)
      .put("/medicamentos/13c0d62e-381d-49cd-9a16-57b875b07065")
      .send({
        nome: "",
        principioAtivo: "Ibuprofeno",
        apresentacao: "Comprimido"
      });

    expect(resposta.status).toBe(400);

    expect(resposta.body).toEqual({
      erro: "Todos os campos são obrigatórios."
    });
  });
  
  // Teste 6: Listar medicamentos ativos com sucesso
  it("deve retornar medicamentos ativos com status 200", async () => {

    // Simular o resultado do PostgreSQL
    const medicamentos = [
      {
        id: "1",
        nome: "Paracetamol 500 mg",
        principioAtivo: "Paracetamol",
        apresentacao: "Comprimido",
        ativo: true
      }
    ];

    queryMock.mockResolvedValueOnce({
      rows: medicamentos
    });

    // Enviar a requisição HTTP
    const resposta = await request(app)
      .get("/medicamentos?ativo=true");

    // Verificar o código HTTP
    expect(resposta.status).toBe(200);

    // Verificar os dados retornados
    expect(resposta.body).toEqual(medicamentos);

    // Verificar se o filtro chegou à consulta SQL
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("FROM medicamentos"),
      [true]
    );
  });
   
  // Teste 7: Cadastrar medicamento com sucesso
  it("deve cadastrar medicamento e retornar status 201", async () => {

    // Limpar registros anteriores da função simulada
    queryMock.mockClear();

    // Simular o medicamento cadastrado no PostgreSQL
    const medicamento = {
      id: "123e4567-e89b-42d3-a456-426614174000",
      nome: "Dipirona 500 mg",
      principioAtivo: "Dipirona",
      apresentacao: "Comprimido",
      ativo: true
    };

    // Simular a resposta do banco
    queryMock.mockResolvedValueOnce({
      rows: [medicamento],
      rowCount: 1
    });

    // Enviar a requisição HTTP
    const resposta = await request(app)
      .post("/medicamentos")
      .send({
        nome: "  Dipirona 500 mg  ",
        principioAtivo: "Dipirona",
        apresentacao: "Comprimido"
      });

    // Verificar o status HTTP
    expect(resposta.status).toBe(201);

    // Verificar os dados retornados
    expect(resposta.body).toEqual(medicamento);

    // Verificar se o PostgreSQL recebeu os dados corretos
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO medicamentos"),
      [
        "Dipirona 500 mg",
        "Dipirona",
        "Comprimido"
      ]
    );
  });
   
  // Teste 8: Atualizar medicamento com sucesso
  it("deve atualizar medicamento e retornar status 200", async () => {

    // Limpar a simulação anterior
    queryMock.mockReset();

    // Identificador fictício do medicamento
    const id = "123e4567-e89b-42d3-a456-426614174000";

    // Simular o medicamento atualizado
    const medicamentoAtualizado = {
      id,
      nome: "Ibuprofeno 600 mg",
      principioAtivo: "Ibuprofeno",
      apresentacao: "Comprimido",
      ativo: true
    };

    // Simular a resposta do PostgreSQL
    queryMock.mockResolvedValueOnce({
      rows: [medicamentoAtualizado],
      rowCount: 1
    });

    // Enviar a requisição HTTP PUT
    const resposta = await request(app)
      .put(`/medicamentos/${id}`)
      .send({
        nome: "  Ibuprofeno 600 mg  ",
        principioAtivo: "Ibuprofeno",
        apresentacao: "Comprimido"
      });

    // Verificar o status HTTP
    expect(resposta.status).toBe(200);

    // Verificar o medicamento retornado
    expect(resposta.body).toEqual(medicamentoAtualizado);

    // Verificar os dados enviados ao PostgreSQL
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE medicamentos"),
      [
        "Ibuprofeno 600 mg",
        "Ibuprofeno",
        "Comprimido",
        id
      ]
    );
  });
   
  // Teste 9: Inativar medicamento com sucesso
  it("deve inativar medicamento e retornar status 200", async () => {

    // Limpar a simulação anterior
    queryMock.mockReset();

    // Identificador fictício do medicamento
    const id = "123e4567-e89b-42d3-a456-426614174000";

    // Simular a resposta do PostgreSQL
    queryMock.mockResolvedValueOnce({
      rows: [{ id }],
      rowCount: 1
    });

    // Enviar a requisição HTTP PATCH
    const resposta = await request(app)
      .patch(`/medicamentos/${id}/inativar`);

    // Verificar o status HTTP
    expect(resposta.status).toBe(200);

    // Verificar a resposta da API
    expect(resposta.body).toEqual({
      mensagem: "Medicamento inativado com sucesso.",
      id
    });

    // Verificar o comando enviado ao PostgreSQL
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("SET ativo = FALSE"),
      [id]
    );
  });
   
  // Teste 10: Inativar medicamento inexistente
  it("deve retornar status 404 quando o medicamento não existir", async () => {

    // Limpar a simulação anterior
    queryMock.mockReset();

    // Identificador fictício
    const id = "123e4567-e89b-42d3-a456-426614174999";

    // Simular o PostgreSQL sem encontrar o medicamento
    queryMock.mockResolvedValueOnce({
      rows: [],
      rowCount: 0
    });

    // Enviar a requisição HTTP PATCH
    const resposta = await request(app)
      .patch(`/medicamentos/${id}/inativar`);

    // Verificar o erro HTTP
    expect(resposta.status).toBe(404);

    // Confirmar que a tentativa chegou ao repositório
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("SET ativo = FALSE"),
      [id]
    );
  });

});

