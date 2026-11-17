
import "dotenv/config";
import process from "node:process";
import { randomUUID } from "node:crypto";
import { conectarRabbitMQ } from "../src/infra/messaging/RabbitMQConnection.js";

async function publicarEventoTeste(): Promise<void> {
  const conexao = await conectarRabbitMQ();

  try {
    const canal = await conexao.createConfirmChannel();

    try {
      await canal.assertExchange(
        "medstock.eventos",
        "topic",
        { durable: true }
      );

      const evento = {
        tipo: "estoque.teste",
        origem: "medstock-core-service",
        ambiente: "teste",
        mensagem: "Primeiro evento do MedStock!",
        data: new Date().toISOString(),
      };

      canal.publish(
        "medstock.eventos",
        "estoque.teste",
        Buffer.from(JSON.stringify(evento)),
        {
          persistent: true,
          contentType: "application/json",
          messageId: randomUUID(),
        }
      );

      await canal.waitForConfirms();

      console.log("Evento publicado com sucesso!");
      console.log(evento);
    } finally {
      await canal.close();
    }
  } finally {
    await conexao.close();
  }
}

publicarEventoTeste().catch((erro) => {
  console.error("Erro ao publicar evento:", erro);
  process.exitCode = 1;
});
