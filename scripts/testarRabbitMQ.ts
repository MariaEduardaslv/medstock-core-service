
import "dotenv/config";
import process from "node:process";
import { conectarRabbitMQ } from "../src/infra/messaging/RabbitMQConnection.js";

async function testarConexao() {
  const conexao = await conectarRabbitMQ();

  console.log("RabbitMQ conectado com sucesso!");

  await conexao.close();
}

testarConexao().catch((erro) => {
  console.error("Falha ao conectar:", erro.message);
  process.exitCode = 1;
});
