
import "dotenv/config";
import process from "node:process";
import { conectarRabbitMQ } from "../src/infra/messaging/RabbitMQConnection.js";

async function configurarRabbitMQ(): Promise<void> {
  const conexao = await conectarRabbitMQ();

  try {
    const canal = await conexao.createChannel();

    try {
      // Criar a exchange principal do MedStock
      await canal.assertExchange(
        "medstock.eventos",
        "topic",
        { durable: true }
      );

      console.log("Exchange medstock.eventos configurada!");

      // Criar a fila do Audit Service
      await canal.assertQueue("medstock.audit", {
        durable: true,
      });

      // Criar a fila do Live Service
      await canal.assertQueue("medstock.live", {
        durable: true,
      });

      // Audit recebe todos os eventos publicados nesta exchange
      await canal.bindQueue(
        "medstock.audit",
        "medstock.eventos",
        "#"
      );

      // Live recebe os eventos relacionados ao estoque
      await canal.bindQueue(
        "medstock.live",
        "medstock.eventos",
        "estoque.#"
      );

      console.log("Filas do MedStock configuradas!");
    } finally {
      await canal.close();
    }
  } finally {
    await conexao.close();
  }
}

configurarRabbitMQ().catch((erro) => {
  console.error("Erro ao configurar RabbitMQ:", erro);
  process.exitCode = 1;
});
