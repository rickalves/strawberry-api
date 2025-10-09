

# 🍓 Strawberry API

API construída com **NestJS**, **TypeORM** e **Supabase (PostgreSQL)** para o **gerenciamento de plantações de morangos**, incluindo o controle de canteiros (plots) e colheitas (harvests).

---

## 🚀 Tecnologias Utilizadas

- [NestJS](https://nestjs.com/) – Framework Node.js moderno e modular  
- [TypeORM](https://typeorm.io/) – ORM para PostgreSQL  
- [Supabase](https://supabase.com/) – Banco de dados Postgres gerenciado  
- [Class Validator / Transformer](https://github.com/typestack/class-validator) – Validação de dados  
- [Dotenv](https://www.npmjs.com/package/dotenv) – Gerenciamento de variáveis de ambiente  

---

## 🌱 Funcionalidades Principais

| Recurso | Descrição |
|----------|------------|
| **Plots (Canteiros)** | CRUD completo (criar, listar, editar, excluir) |
| **Harvests (Colheitas)** | Registrar e listar colheitas por canteiro |
| **Resumo por Canteiro** | Total de quilos colhidos em cada canteiro |

---

## 🧩 Estrutura de Pastas

```bash
src/
├── app.module.ts                # Módulo raiz que integra todos os módulos da aplicação
├── main.ts                      # Ponto de entrada do servidor NestJS
│
├── database/
│    ├── data-source.ts          # Configuração do TypeORM e conexão com o Supabase
│    └── migrations/             # Migrações do banco de dados
│
├── plots/                       # Módulo de canteiros (plots)
│    ├── plot.entity.ts          # Entidade Plot (estrutura da tabela)
│    ├── plots.controller.ts     # Rotas HTTP para CRUD de canteiros
│    ├── plots.service.ts        # Regras de negócio e acesso ao banco
│    ├── plots.module.ts         # Módulo NestJS do recurso Plot
│    └── dto/                    # DTOs e validações de entrada
│
├── harvests/                    # Módulo de colheitas (harvests)
│    ├── harvest.entity.ts       # Entidade Harvest (estrutura da tabela)
│    ├── harvests.controller.ts  # Rotas HTTP para gerenciar colheitas
│    ├── harvests.service.ts     # Lógica e persistência de colheitas
│    ├── harvests.module.ts      # Módulo NestJS do recurso Harvest
│    └── dto/                    # DTOs e validações de entrada

```

---

## ⚙️ Configuração e Instalação

### 1️⃣ Clone o repositório
```bash
git clone https://github.com/seu-usuario/strawberry-api.git
cd strawberry-api
````

### 2️⃣ Instale as dependências

```bash
npm install
```

### 3️⃣ Configure o arquivo `.env`

Crie um arquivo `.env` na raiz com sua conexão do Supabase:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require
NODE_ENV=development
```

> ⚠️ O Supabase requer SSL.
> O projeto já está configurado com `ssl: { rejectUnauthorized: false }`.

### 4️⃣ Rode as migrações

```bash
npm run migration:run
```

### 5️⃣ Inicie o servidor

```bash
npm run start:dev
```

API disponível em:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Testes com Postman

Uma coleção Postman já está pronta para uso!
Baixe e importe os arquivos abaixo:

* 📁 [strawberry-api.postman_collection.json](./test/strawberry-api.postman_collection.json)

### Fluxo sugerido:

1. `Plots / Create Plot`
2. `Harvests / Create Harvest`
3. `Plots / Summary`
4. `Cleanup / Delete Plot`

> Todos os testes validam status, estrutura e salvam IDs automaticamente entre requisições.

---

## 🔗 Endpoints Principais

| Método   | Rota                     | Descrição                                 |
| -------- | ------------------------ | ----------------------------------------- |
| `POST`   | `/plots`                 | Cria um novo canteiro                     |
| `GET`    | `/plots`                 | Lista todos os canteiros                  |
| `GET`    | `/plots/:id`             | Busca um canteiro específico              |
| `PATCH`  | `/plots/:id`             | Atualiza dados do canteiro                |
| `DELETE` | `/plots/:id`             | Remove o canteiro (cascata nas colheitas) |
| `GET`    | `/plots/:id/summary`     | Total de kg colhidos no canteiro          |
| `POST`   | `/harvests`              | Registra uma nova colheita                |
| `GET`    | `/harvests`              | Lista todas as colheitas                  |
| `GET`    | `/harvests/plot/:plotId` | Lista colheitas de um canteiro            |

---

## 🧰 Scripts Úteis

```bash
# Rodar servidor
npm run start:dev

# Criar migration automaticamente
npm run migration:generate

# Executar migrations
npm run migration:run

# Reverter última migration
npm run migration:revert
```

---

## 🧠 Ideias Futuras

* [ ] Autenticação com Supabase Auth
* [ ] Dashboard de produtividade por período
* [ ] Exportação de relatórios em PDF
* [ ] Integração com sensores IoT de umidade e temperatura

---

> 💡 Projeto experimental para fins de aprendizado em NestJS, TypeORM e Supabase.


