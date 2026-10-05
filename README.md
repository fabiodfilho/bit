# BitDesk

Portal web para gerenciamento de solicitações internas, desenvolvido com React no frontend e FastAPI no backend. O sistema permite autenticação, abertura e acompanhamento de solicitações, filtros, compartilhamento, dashboard, calendário e gerenciamento de usuários.

> Projeto em desenvolvimento. Antes de usar em produção, revise as configurações de segurança, credenciais iniciais, CORS, armazenamento de arquivos e variáveis de ambiente.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Configuração](#configuração)
- [Como executar](#como-executar)
- [Testes](#testes)
- [Documentação da API](#documentação-da-api)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Segurança](#segurança)
- [Contribuição](#contribuição)
- [Licença](#licença)

## Funcionalidades

- Login com autenticação JWT.
- Cadastro, edição, listagem e exclusão de usuários.
- Upload de avatar.
- Criação, edição, exclusão e consulta de solicitações.
- Atualização de status das solicitações.
- Filtros por status, categoria, texto e período.
- Abas para solicitações próprias e compartilhadas.
- Compartilhamento de solicitações com outros usuários.
- Dashboard com indicadores.
- Calendário com prazos previstos.
- Interface responsiva com tema claro e escuro.
- Testes de API com pytest e testes de interface com Vitest e React Testing Library.

## Tecnologias

### Backend

- Python 3.11+
- FastAPI
- Uvicorn
- SQLAlchemy
- SQLite para desenvolvimento
- PostgreSQL opcional
- Pydantic
- JWT com `python-jose`
- Passlib e Bcrypt
- `python-multipart` para uploads
- Pytest e HTTPX para testes

### Frontend

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- FullCalendar
- Lucide React
- Vitest
- React Testing Library
- jsdom
- ESLint

## Arquitetura

O projeto é dividido em dois módulos:

```text
bitdesk/
├── backend/     # API FastAPI, regras de negócio e persistência
├── frontend/    # Aplicação React e interface web
├── tests/       # Testes automatizados do backend
├── pytest.ini   # Configuração do pytest
└── docs/        # Documentação técnica adicional
```

O frontend consome a API através de Axios. Por padrão, a API fica disponível em `http://127.0.0.1:8000` e o frontend em `http://localhost:5173`.

## Pré-requisitos

- Git
- Python 3.11 ou superior
- Node.js 20 ou superior
- npm

## Configuração

Clone o repositório e entre na pasta do projeto:

```powershell
git clone <URL_DO_REPOSITORIO>
cd bitdesk
```

### Backend

Crie ou utilize um ambiente virtual:

```powershell
python -m venv backend\venv
.\backend\venv\Scripts\Activate.ps1
```

Instale as dependências:

```powershell
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
```

### Frontend

Instale as dependências:

```powershell
cd frontend
npm install
cd ..
```

## Como executar

Os testes e servidores não são executados automaticamente apenas por existirem. É necessário iniciar cada comando manualmente ou configurá-lo em uma ferramenta de automação/CI.

### Backend

Na raiz do projeto:

```powershell
.\backend\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload
```

Se o ambiente virtual estiver ativado, também é possível executar:

```powershell
python -m uvicorn app.main:app --app-dir backend --reload
```

A API ficará disponível em:

- API: <http://127.0.0.1:8000>
- Swagger UI: <http://127.0.0.1:8000/docs>
- ReDoc: <http://127.0.0.1:8000/redoc>

### Frontend

Em outro terminal:

```powershell
cd frontend
npm run dev
```

Abra <http://localhost:5173> no navegador.

### Build de produção do frontend

```powershell
cd frontend
npm run build
```

Para visualizar o build localmente:

```powershell
npm run preview
```

## Testes

### Backend — execução única

Na raiz do projeto:

```powershell
.\backend\venv\Scripts\python.exe -m pytest
```

O arquivo `pytest.ini` configura o diretório de testes e o caminho do pacote `backend`, portanto não é necessário alterar o `PYTHONPATH`.

### Frontend — execução única

```powershell
cd frontend
npm run test:run
```

### Frontend — modo automático

```powershell
cd frontend
npm test
```

Nesse modo, o Vitest observa os arquivos e reexecuta os testes relacionados sempre que você salva uma alteração. Para sair, pressione `Ctrl+C`.

### Execução simultânea

Use dois terminais:

**Terminal 1 — API:**

```powershell
cd bitdesk
.\backend\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload
```

**Terminal 2 — frontend:**

```powershell
cd bitdesk\frontend
npm run dev
```

Os testes podem ser executados em um terceiro terminal:

```powershell
cd bitdesk
.\backend\venv\Scripts\python.exe -m pytest

cd frontend
npm run test:run
```

## Documentação da API

Com o backend em execução, consulte a documentação interativa em:

- Swagger UI: <http://127.0.0.1:8000/docs>
- ReDoc: <http://127.0.0.1:8000/redoc>

Principais grupos de endpoints:

| Grupo | Prefixo | Exemplos |
| --- | --- | --- |
| Autenticação | `/api/v1/auth` | login, cadastro e usuário atual |
| Solicitações | `/api/v1/solicitacoes` | criar, listar, editar, excluir e compartilhar |
| Dashboard | `/api/v1/dashboard` | indicadores |
| Auxiliares | `/api/v1` | categorias e usuários para seleção |
| Usuários | `/api/v1/usuarios` | perfil, avatar e administração |

## Estrutura do projeto

```text
bitdesk/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py
│   │   │   └── v1/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── db/
│   │   ├── schemas/
│   │   └── main.py
│   ├── requirements.txt
│   └── uploads/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
├── tests/
│   └── test_main.py
├── docs/
├── pytest.ini
└── readme.md
```

## Variáveis de ambiente

O backend carrega um arquivo `.env` quando presente. O arquivo não deve ser versionado. Use valores próprios no ambiente local e, principalmente, em produção:

```dotenv
DATABASE_URL=sqlite:///./bitdesk.db
SECRET_KEY=gere-uma-chave-longa-e-aleatoria
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

Para PostgreSQL, substitua `DATABASE_URL` por uma URL compatível com SQLAlchemy, por exemplo:

```dotenv
DATABASE_URL=postgresql+psycopg2://usuario:senha@localhost:5432/bitdesk
```

## Segurança

Antes de publicar ou disponibilizar o sistema em produção:

- Gere uma `SECRET_KEY` forte e exclusiva.
- Nunca publique o arquivo `.env`, tokens, senhas ou bancos locais.
- Troque ou remova as credenciais administrativas criadas automaticamente no startup.
- Restrinja `allow_origins` do CORS aos domínios reais do frontend.
- Use HTTPS.
- Configure corretamente permissões e limites para uploads.
- Revise o tempo de expiração dos tokens.
- Não use o banco SQLite local como banco de produção sem avaliar concorrência, backup e permissões.
- Remova arquivos, bancos e uploads locais que contenham dados reais antes de tornar o repositório público.

O `.gitignore` já inclui ambientes virtuais, bancos SQLite, arquivos `.env` e caches comuns. Ainda assim, revise o histórico do Git antes de publicar para garantir que nenhum segredo tenha sido commitado anteriormente.

## Contribuição

1. Crie uma branch para sua alteração:

   ```powershell
   git checkout -b feature/minha-alteracao
   ```

2. Faça a alteração e adicione testes quando aplicável.
3. Execute os testes do backend e frontend.
4. Execute o build do frontend.
5. Abra um Pull Request descrevendo o que foi alterado e como validar.

Comandos de validação:

```powershell
.\backend\venv\Scripts\python.exe -m pytest
cd frontend
npm run test:run
npm run build
```

## Licença

Este projeto ainda não possui um arquivo de licença definido. Antes de disponibilizá-lo publicamente, escolha e adicione uma licença compatível com o uso que você deseja permitir.
