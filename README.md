# API de Gerenciamento de Pedidos - Tech Test

Este projeto é uma API RESTful para gerenciamento de pedidos, usuários e autenticação, com integração a uma API externa para processamento de pedidos acima de 1000 unidades.

## Índice

- [Requisitos](#requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Iniciando o Projeto](#iniciando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Endpoints da API](#endpoints-da-api)
  - [Autenticação](#autenticação)
  - [Usuários](#usuários)
  - [Pedidos](#pedidos)
- [Mecanismo de Retry para API Externa](#mecanismo-de-retry-para-api-externa)
- [Testando a API com Postman](#testando-a-api-com-postman)
- [Considerações sobre o Projeto](#considerações-sobre-o-projeto) - IMPORTANTE
- [Comandos Úteis](#comandos-úteis)

## Requisitos

- Node.js (v16+)
- Docker e Docker Compose
- Yarn

## Instalação e Configuração

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd <nome-do-repositorio>
   ```

2. Instale as dependências:
   ```bash
   yarn install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env` conforme necessário.

## Iniciando o Projeto

1. Inicie o projeto em modo de desenvolvimento (isso iniciará o Docker e o servidor):
   ```bash
   yarn watch
   ```

2. Em outro terminal, execute as migrações do banco de dados:
   ```bash
   yarn sequelize db:migrate
   ```

3. Execute os seeds para popular o banco com dados iniciais:
   ```bash
   yarn sequelize db:seed:all
   ```

4. A API estará disponível em: `http://localhost:3001/api`

## Estrutura do Projeto

O projeto segue uma arquitetura modular baseada em domínios:

- `src/modules/` - Contém os módulos da aplicação (auth, users, orders)
- `src/shared/` - Código compartilhado entre os módulos
- `src/shared/infra/` - Infraestrutura compartilhada (HTTP, banco de dados)
- `src/shared/services/` - Serviços compartilhados

## Endpoints da API

### Autenticação

- **POST /api/auth/login** - Autenticar usuário
  - Body: `{ "email": "string", "password": "string" }`
  - Response: `{ "user": {...} }`
  - Nota: O token de autenticação é enviado como cookie HttpOnly e não no corpo da resposta

- **GET /api/auth/session** - Verificar sessão atual
  - Nota: Utiliza o cookie HttpOnly para autenticação, não é necessário enviar token no header

- **GET /api/auth/logout** - Encerrar sessão
  - Nota: Utiliza o cookie HttpOnly para autenticação

- **POST /api/auth/refresh** - Renovar token de acesso
  - Nota: Utiliza o cookie HttpOnly de refresh token, não é necessário enviar no body

### Usuários

- **GET /api/users** - Listar todos os usuários
  - Response: `[{ "uuid": "string", "email": "string", ... }]`

- **GET /api/users/:id** - Obter usuário por ID
  - Response: `{ "uuid": "string", "email": "string", ... }`

- **POST /api/users** - Criar novo usuário (requer permissão de ADMIN)
  - Body: `{ "email": "string", "password": "string", ... }`
  - Response: `{ "uuid": "string", "email": "string", ... }`

- **POST /api/users/create-customer** - Criar cliente (requer permissão de RESELLER)
  - Body: `{ "email": "string", "password": "string", ... }`
  - Response: `{ "uuid": "string", "email": "string", ... }`

- **PATCH /api/users/:id** - Atualizar usuário (requer permissão de ADMIN)
  - Body: `{ "email": "string", ... }`
  - Response: `{ "uuid": "string", "email": "string", ... }`

- **DELETE /api/users/:id** - Excluir usuário (requer permissão de ADMIN)

### Pedidos

- **POST /api/orders** - Criar novo pedido (requer permissão de CUSTOMER)
  - Body:
    ```json
    {
      "cnpj": "string",
      "items": [
        {
          "productId": "uuid",
          "productName": "string",
          "quantity": number
        }
      ],
      "observations": "string" (opcional)
    }
    ```
  - Response:
    ```json
    {
      "orderId": "uuid",
      "items": [...],
      "status": "Pending" | "Processing",
      "observations": "string",
      "createdAt": "date",
      "externalOrderId": "string" (se enviado para API externa)
    }
    ```

- **GET /api/orders/:id** - Obter pedido por ID (requer permissão de CUSTOMER)
  - Response:
    ```json
    {
      "orderId": "uuid",
      "resellerId": "uuid",
      "items": [...],
      "status": "string",
      "observations": "string",
      "createdAt": "date",
      "updatedAt": "date",
      "externalOrderId": "string" (se enviado para API externa)
    }
    ```

## Mecanismo de Retry para API Externa

O sistema possui um mecanismo de retry para pedidos que não puderam ser enviados para a API externa devido a falhas de comunicação. Este mecanismo funciona da seguinte forma:

1. **Critério para envio à API externa**: Pedidos com quantidade total igual ou superior a 1000 unidades são enviados para a API externa.

2. **Processo de retry**:
   - Quando um pedido falha ao ser enviado para a API externa, ele é adicionado a uma fila de pendências.
   - A cada 5 segundos, o sistema tenta reenviar todos os pedidos pendentes.
   - Para cada tentativa, há uma simulação com 30% de chance de sucesso.
   - Se a simulação for bem-sucedida, o pedido é removido da fila e seu status é atualizado no banco de dados para "Processed".
   - Se a simulação falhar, o sistema tenta enviar o pedido para a API externa novamente.

3. **Simulação de sucesso**:
   - A simulação de sucesso foi implementada para facilitar testes e demonstração do sistema.
   - Quando um pedido é processado com sucesso na simulação, um ID externo no formato `mock_success_[timestamp]` é gerado.
   - O status do pedido é atualizado no banco de dados para "Processed".
   - O pedido é removido da fila de pendências.

4. **Logs**:
   - O sistema registra logs detalhados sobre o processo de retry, incluindo tentativas, sucessos e falhas.
   - Os logs são armazenados no diretório `logs/` e podem ser consultados para acompanhar o processamento dos pedidos.

## Testando a API com Postman

O projeto inclui uma coleção do Postman para facilitar os testes da API:

1. **Arquivo da coleção**: `Tech Test API.postman_collection.json` na raiz do projeto.

2. **Como usar**:
   - Importe a coleção no Postman
   - A coleção já está configurada com todas as requisições necessárias para testar a API
   - As requisições estão organizadas por módulos (Auth, Users, Orders)
   - Para autenticação, execute primeiro a requisição "Login" e as demais requisições utilizarão automaticamente o cookie de autenticação

3. **Testando o mecanismo de retry**:
   - Use a requisição "Create Order (1000+ units)" para criar um pedido com mais de 1000 unidades
   - Verifique nos logs do servidor o processo de retry e a simulação de sucesso
   - Use a requisição "Get Order By ID" para verificar o status atualizado do pedido

## Considerações sobre o Projeto

Este projeto foi desenvolvido exclusivamente como parte de um teste técnico e serve como demonstração de conceitos e habilidades de desenvolvimento. Em um cenário de produção real, diversas melhorias e adaptações seriam necessárias:

### Arquitetura e Escalabilidade

- **Filas de Mensagens**: Substituição do mecanismo de retry em memória por uma solução robusta de filas como RabbitMQ, Apache Kafka ou AWS SQS para garantir persistência e escalabilidade.
- **Microserviços**: Potencial separação em microserviços distintos para gerenciamento de usuários, pedidos e integração com APIs externas.
- **Containers e Orquestração**: Implementação completa com Docker e Kubernetes para orquestração de containers e escalabilidade horizontal.

### Segurança e Robustez

- **Autenticação Avançada**: Implementação de OAuth 2.0 ou OpenID Connect para autenticação mais robusta.
- **Rate Limiting**: Proteção contra abusos com limitação de requisições.
- **Monitoramento Avançado**: Integração com ferramentas como Prometheus, Grafana e ELK Stack para monitoramento em tempo real.
- **Testes Automatizados**: Expansão da cobertura de testes unitários, de integração e end-to-end.

### Integração e Processamento

- **Circuit Breaker**: Implementação de padrões como Circuit Breaker para lidar com falhas de serviços externos.
- **Idempotência**: Garantia de idempotência em todas as operações críticas.
- **Transações Distribuídas**: Implementação de padrões como Saga para gerenciar transações distribuídas.
- **Webhooks**: Adição de webhooks para notificações em tempo real sobre mudanças de status.

Este projeto demonstra conceitos fundamentais de desenvolvimento de APIs, integração de sistemas e tratamento de falhas, mas em um ambiente de produção, seria necessário um investimento significativo em infraestrutura, segurança e arquitetura para garantir a confiabilidade, escalabilidade e manutenibilidade do sistema.

## Comandos Úteis

```
"watch" - Inicia o projeto em modo de desenvolvimento (Docker + servidor)
"watch:services" - Inicia apenas os serviços Docker
"watch:nodemon" - Inicia apenas o servidor Node.js
"create-module" - Cria um novo módulo
"lint" - Executa o linter
"build" - Compila o projeto para produção
"start" - Inicia o projeto em modo de produção
"sequelize" - Executa comandos do Sequelize CLI
"db:migrate:create" - Cria uma nova migração
"db:seed:all" - Executa todos os seeds
"db:seed:undo:all" - Desfaz todos os seeds
"db:migrate" - Executa as migrações pendentes
"db:migrate:undo" - Desfaz a última migração
"db:migrate:undo:all" - Desfaz todas as migrações
```