
# MedStock — Core Service

Serviço A (Core) da plataforma distribuída MedStock.

Responsável pelo gerenciamento de medicamentos,
lotes, movimentações de estoque e aplicação das
principais regras de negócio.

## 1. Sobre o projeto

O MedStock é uma plataforma de gerenciamento de
estoque de medicamentos baseada em microserviços.

O Core Service é responsável por:

- Cadastrar e consultar medicamentos.
- Atualizar e inativar medicamentos.
- Cadastrar e consultar lotes.
- Controlar quantidades disponíveis em estoque.
- Registrar entradas e saídas de medicamentos.
- Impedir saídas superiores ao estoque disponível.
- Proteger a última unidade contra retiradas
  concorrentes.
- Manter o histórico de movimentações.

## 2. Tecnologias utilizadas

- Node.js
- TypeScript
- Express
- PostgreSQL 16
- Docker
- Vitest
- Supertest

## 3. Arquitetura

O projeto é organizado seguindo princípios
de Clean Architecture.

Principais diretórios:

- src/core/domain/entities:
  entidades do domínio.

- src/core/dtos:
  estruturas de entrada de dados.

- src/core/ports:
  interfaces para acesso aos dados.

- src/core/use-cases:
  regras e casos de uso da aplicação.

- src/infra/database:
  implementações dos repositórios PostgreSQL.

- src/infra/http:
  rotas HTTP da aplicação.

- tests:
  testes automatizados.

- database/migrations:
  scripts SQL de criação e evolução do banco.

## 4. Banco de dados

O Core Service utiliza PostgreSQL.

As tabelas principais são:

### medicamentos

Armazena os medicamentos cadastrados.

Campos principais:

- id
- nome
- principio_ativo
- apresentacao
- ativo
- created_at

### lotes

Armazena os lotes dos medicamentos.

Campos principais:

- id
- medicamento_id
- numero_lote
- data_validade
- quantidade_atual
- created_at

### movimentacoes_estoque

Registra as entradas e saídas realizadas.

Campos principais:

- id
- lote_id
- tipo
- quantidade
- criada_em

## 5. Migração do banco

A estrutura inicial está no arquivo:

database/migrations/001_initial_schema.sql

A migração deve ser executada em um banco vazio.

Ela cria as três tabelas, seus relacionamentos,
restrições e índices.

O script foi validado com PostgreSQL 16
em um banco de teste separado.

Atenção: não execute a migração inicial sobre
um banco que já contenha essas tabelas.

## 6. Instalação

Requisitos:

- Node.js e npm instalados.
- Docker Desktop funcionando.
- Infraestrutura do MedStock configurada.
- PostgreSQL disponível.

Instale as dependências:

npm install

Configure as variáveis de ambiente no arquivo .env.

O arquivo .env deve permanecer fora do Git.

Inicie o serviço em desenvolvimento:

npm run dev

Por padrão, nos testes locais realizados,
a aplicação foi executada na porta 3000.

## 7. Principais endpoints

### Saúde da aplicação

GET /health

GET /health/database

### Medicamentos

GET /medicamentos

GET /medicamentos/:id

POST /medicamentos

PUT /medicamentos/:id

PATCH /medicamentos/:id/inativar

### Lotes

POST /lotes

GET /medicamentos/:id/lotes

### Movimentações de estoque

POST /movimentacoes-estoque

Tipos de movimentação:

- ENTRADA
- SAIDA

Exemplo de saída:

{
  "loteId": "UUID_DO_LOTE",
  "tipo": "SAIDA",
  "quantidade": 1
}

## 8. Controle de concorrência

Um dos requisitos principais do MedStock é
impedir a dupla retirada da última unidade
de medicamento disponível.

Cenário:

Dois operadores tentam registrar a saída
da última unidade simultaneamente.

O Core Service utiliza transações PostgreSQL
e atualização condicional de estoque.

A saída somente é autorizada quando existe
quantidade suficiente.

No teste realizado:

- Solicitação A: HTTP 201.
- Solicitação B: HTTP 409.
- Estoque inicial: 1.
- Estoque final: 0.
- Saídas registradas: 1.

O resultado confirma que, nesse cenário,
a dupla retirada foi impedida.

## 9. Testes automatizados

O projeto utiliza Vitest e Supertest.

Verificação de tipos:

npm run typecheck

Execução dos testes:

npm test

Compilação:

npm run build

Execução da versão compilada:

npm start

Na etapa atual, foram aprovados:

- 50 testes.
- 14 arquivos de testes.
- Compilação TypeScript sem erros.

O teste de concorrência utiliza PostgreSQL real,
cria seus próprios registros e remove os dados
de teste ao finalizar.

Os testes de integração devem ser executados
em um banco de desenvolvimento ou teste,
nunca em produção.

## 10. Integração com outros serviços

O Core Service faz parte da arquitetura
distribuída do MedStock.

Integrações planejadas:

- RabbitMQ para publicação de eventos.
- Live Service para atualizações em tempo real.
- Audit Service para auditoria dos eventos.
- Aplicação Web.
- Aplicação Mobile com inventário offline.

A publicação de eventos e as demais integrações
ainda estão em desenvolvimento.

## 11. Próximas funcionalidades

- Transactional Outbox.
- Publicação confiável de eventos no RabbitMQ.
- Identificação e autorização dos operadores.
- Sincronização de inventários offline.
- Integração com Live Service e Audit Service.
- Documentação adicional e testes de integração.

## 12. Repositórios do MedStock

A plataforma é organizada em seis repositórios:

- medstock-infrastructure
- medstock-core-service
- medstock-live-service
- medstock-audit-service
- medstock-web
- medstock-mobile

Cada componente possui seu próprio repositório Git.
