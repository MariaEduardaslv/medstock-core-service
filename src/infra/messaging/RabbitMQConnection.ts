
import { connect, type ChannelModel } from "amqplib";

export async function conectarRabbitMQ(): Promise<ChannelModel> {
  const usuario = process.env.RABBITMQ_USER;
  const senha = process.env.RABBITMQ_PASSWORD;

  if (!usuario || !senha) {
    throw new Error("Credenciais do RabbitMQ não configuradas.");
  }

  const conexao = await connect({
    protocol: "amqp",
    hostname: process.env.RABBITMQ_HOST ?? "localhost",
    port: Number(process.env.RABBITMQ_PORT ?? "5672"),
    username: usuario,
    password: senha,
    vhost: "/",
    heartbeat: 30,
  });

  conexao.on("error", (erro) => {
    console.error("Erro na conexão RabbitMQ:", erro.message);
  });

  conexao.on("close", () => {
    console.log("Conexão RabbitMQ encerrada.");
  });

  return conexao;
}
