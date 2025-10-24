# 🍓 Strawberry API

API construída com **NestJS**, **TypeORM** e **Supabase (PostgreSQL)** para o **gerenciamento de plantações de morangos**, incluindo **autenticação de usuários**, **controle de acessos por roles**, **canteiros (plots)** e **colheitas (harvests)**.

---

## 🚀 Tecnologias Utilizadas

* **NestJS** – Framework Node.js modular e escalável
* **TypeORM** – ORM para PostgreSQL
* **Supabase** – Banco de dados e autenticação gerenciada
* **Class Validator / Transformer** – Validação de DTOs
* **JWT + Guards + Roles** – Proteção e autorização de rotas
* **Dotenv** – Configuração de variáveis de ambiente

---

## 🌱 Funcionalidades Principais

| Recurso                  | Descrição                                               |
| ------------------------ | ------------------------------------------------------- |
| **Auth (Autenticação)**  | Registro, login, definição de roles e proteção de rotas |
| **Plots (Canteiros)**    | CRUD completo (criar, listar, editar, excluir)          |
| **Harvests (Colheitas)** | Registro e listagem de colheitas por canteiro           |
| **Resumo de Produção**   | Exibe total de quilos colhidos por canteiro             |

---

## 🧩 Estrutura de Pastas

```
src/
├── app.module.ts                      # Módulo raiz que integra todos os módulos
├── main.ts                            # Ponto de entrada da aplicação NestJS
│
├── auth/                              # 🔐 Módulo de autenticação
│   ├── auth.module.ts                 # Declara o módulo e providers globais (Guards e Providers)
│   ├── auth.controller.ts             # Controlador com endpoints de login, registro e roles
│   ├── auth.service.ts                # Lógica de autenticação, registro e roles
│   ├── jwt-auth.guard.ts              # Guard responsável por validar JWTs do Supabase
│   ├── roles.guard.ts                 # Guard de verificação de permissões por role
│   ├── roles.decorator.ts             # Decorator @Roles() para proteger rotas por perfil
│   ├── supabase-client.provider.ts    # Provider que instancia o SupabaseClient com a service role key
│
├── database/
│   ├── data-source.ts                 # Configuração TypeORM e conexão com o Supabase
│   └── migrations/                    # Migrações do banco de dados
│
├── plots/                             # 🌾 Módulo de canteiros
│   ├── plot.entity.ts                 # Entidade Plot (estrutura da tabela)
│   ├── plots.controller.ts            # Endpoints HTTP de CRUD
│   ├── plots.service.ts               # Lógica e persistência de dados
│   ├── plots.module.ts                # Módulo NestJS do recurso Plot
│   └── dto/                           # DTOs de criação e atualização
│
├── harvests/                          # 🍓 Módulo de colheitas
│   ├── harvest.entity.ts              # Entidade Harvest (estrutura da tabela)
│   ├── harvests.controller.ts         # Endpoints HTTP de registro e listagem
│   ├── harvests.service.ts            # Regras de negócio e queries
│   ├── harvests.module.ts             # Módulo NestJS do recurso Harvest
│   └── dto/                           # DTOs de entrada de dados
│
└── common/                            # (Opcional) Decorators, interceptors e utils compartilhados
```

---

## 🔐 Módulo Auth – Visão Geral

**Objetivo:** Gerenciar autenticação, autorização e controle de perfis de acesso.
Integrado diretamente ao **Supabase Auth**, usando **Service Role Key** para criar e gerenciar usuários de forma segura.

### Principais Recursos:

* **/auth/register** – Criação de usuário com role padrão `user`
* **/auth/login** – Retorna token JWT do Supabase
* **/auth/admin-create** – Criação de usuário com role definida, apenas para admins
* **/auth/set-role** – Atualização de roles (admin ↔ user)
* **/auth/test-role** – Endpoint protegido para testes de roles
* **/auth/profile** – Retorna informações do usuário autenticado

### Controle de Acesso (Roles):

* As roles são armazenadas em `user_metadata.role` no Supabase.
* O **RolesGuard** valida se o token JWT possui permissão para acessar a rota.
* Apenas `admin` pode alterar roles de outros usuários.
* Rotas sensíveis (como `createPlot`) exigem permissão `admin`.

---

## ⚙️ Configuração Básica

**Variáveis de Ambiente (.env):**

* `SUPABASE_URL`
* `SUPABASE_SERVICE_ROLE_KEY`
* `DATABASE_URL`
* `JWT_SECRET`
* `NODE_ENV`

---

## 🔗 Endpoints Principais

| Método  | Rota                 | Descrição                              |
| ------- | -------------------- | -------------------------------------- |
| `POST`  | `/auth/register`     | Criação de usuário                     |
| `POST`  | `/auth/login`        | Login e obtenção de token              |
| `PATCH` | `/auth/set-role`     | Alterar role (somente admin)           |
| `GET`   | `/auth/profile`      | Retorna dados do usuário autenticado   |
| `GET`   | `/plots`             | Listar canteiros (usuário autenticado) |
| `POST`  | `/plots`             | Criar canteiro (somente admin)         |
| `POST`  | `/harvests`          | Registrar colheita                     |
| `GET`   | `/plots/:id/summary` | Resumo de colheitas                    |

---

## 🧠 Ideias Futuras

* Painel de controle com dados agregados de produção
* Upload de imagens e relatórios PDF
* Dashboard com produtividade por período
* Integração com sensores IoT
* Rastreabilidade

---

> 💡 Projeto experimental para aprendizado em **NestJS, Supabase Auth, TypeORM e arquitetura modular**.
> Desenvolvido com foco em **boas práticas de autenticação e controle de acesso baseado em roles**.

---
