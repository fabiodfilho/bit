# Memorial Técnico de Desenvolvimento

## 1. Tecnologias Utilizadas

O BitDesk é uma aplicação web para gerenciamento de solicitações internas. O código está organizado em dois módulos principais dentro do projeto: `frontend` e `backend`.

### Frontend

* **JavaScript (ES Modules) e JSX**: linguagem utilizada para a lógica da interface e para a declaração dos componentes React.


* **React 19**: biblioteca principal de construção da interface, com componentes funcionais, hooks (`useState`, `useEffect`, `useContext`) e composição de telas.


* **Vite 8**: servidor de desenvolvimento, empacotador e ferramenta de build do frontend. O projeto utiliza `@vitejs/plugin-react`.


* **React Router DOM 7**: roteamento client-side entre login, dashboard, solicitações, calendário e perfil, incluindo rotas protegidas.


* **Axios**: cliente HTTP centralizado em `src/services/api.js`, com base URL dinâmica da API (via `import.meta.env.VITE_API_URL`) e interceptor para anexar o token Bearer.


* **Tailwind CSS 4** e **@tailwindcss/vite**: estilização utilitária, incluindo variantes de tema claro/escuro e estados responsivos.


* **Lucide React**: biblioteca de ícones usada na navegação, formulários, indicadores e ações.


* **FullCalendar**: calendário mensal, semanal e diário para exibição dos prazos das solicitações.


* **react-hot-toast**: notificações de sucesso, erro e carregamento nas operações da aplicação.


* **Vitest e React Testing Library**: framework e biblioteca de testes para validação automatizada de renderização de componentes e simulação de rotas no frontend.

### Backend

* **Python**: linguagem da API e das regras de negócio.


* **FastAPI**: framework para exposição da API REST, definição de rotas, dependências, documentação OpenAPI e serialização das respostas.


* **Uvicorn**: servidor ASGI previsto para execução da aplicação FastAPI.


* **Pydantic 2**: modelos de entrada e saída, validação de campos, limites de tamanho e conversão de dados.


* **SQLAlchemy 2**: ORM e camada de acesso a dados, com modelos declarativos, relacionamentos, filtros e sessões transacionais.


* **SQLite**: banco de dados padrão configurado em `sqlite:///./bitdesk.db`, adequado ao desenvolvimento local e a instalações pequenas.


* **python-jose**, **Passlib e Bcrypt**: criação, assinatura e validação de tokens JWT, além de hashing e verificação das senhas.


* **Pytest e httpx**: infraestrutura de testes automatizados da API, utilizando um banco de dados em memória totalmente isolado para garantir a integridade das validações.

### Infraestrutura e CI/CD

* **GitHub Actions**: pipeline de Integração Contínua (CI) responsável por garantir a qualidade do código, executando *lint*, *build* e os testes automatizados (backend e frontend) a cada *push* ou *Pull Request* na branch principal.
* **Render**: plataforma de Entrega Contínua (CD) que hospeda a aplicação em produção. O backend é executado como um *Web Service*, enquanto o frontend é servido como um *Static Site*, com variáveis de ambiente injetadas de forma segura (`SECRET_KEY`, `VITE_API_URL`, `CORS_ORIGINS`).

## Execução dos Testes e Deploy

O sistema conta com um fluxo de CI/CD automatizado no GitHub Actions, garantindo que novos códigos só cheguem à produção no Render caso passem nas validações. Para executá-los manualmente no ambiente local:

### Backend

Na raiz do projeto (`bitdesk`), com a virtualenv do backend configurada:

```powershell
.\backend\venv\Scripts\python.exe -m pytest

```

O arquivo `pytest.ini` configura o caminho do pacote `backend`, então o comando funciona mesmo sendo executado a partir da raiz.

### Frontend

```powershell
Set-Location .\frontend
npm run test:run

```

Para manter o Vitest observando alterações e reexecutando os testes:

```powershell
Set-Location .\frontend
npm test

```

O modo de observação permanece ativo até ser interrompido com `Ctrl+C`.

## 2. Justificativa Técnica

(As seções de justificativa para React, FastAPI, SQLAlchemy, JWT, etc., permanecem idênticas à documentação original, refletindo a separação de responsabilidades e as escolhas de design).

## 3. Justificativa Conceitual

O sistema adota uma arquitetura cliente-servidor, onde o frontend React atua como uma SPA e se comunica com a API FastAPI através de requisições HTTP REST/JSON. Em produção, esta comunicação ocorre de forma dinâmica através de variáveis de ambiente.

A modelagem de dados é relacional e o controle de estado e autenticação é gerenciado no frontend via Context API e persistência de token.

## 4. Análise Crítica

### Limitações da solução implementada

* **CORS excessivamente permissivo no ambiente de desenvolvimento:** `allow_origins=["*"]`, com credenciais habilitadas, ainda consta no código base e depende da injeção correta da variável `CORS_ORIGINS` em produção.


* **Persistência local e migração:** SQLite é conveniente para desenvolvimento, mas o bootstrap com `Base.metadata.create_all` e um `ALTER TABLE` manual não substitui migrações versionadas.


* **Armazenamento do token:** `localStorage` é simples, porém aumenta o impacto de uma eventual vulnerabilidade XSS. Também não há fluxo explícito de refresh ou revogação de tokens.


* **Autorização incompleta em alguns fluxos:** a regra de usuário autenticado existe em boa parte das rotas, mas operações como upload de avatar não recebem a dependência de usuário atual.


* **Upload de arquivos:** o nome original do arquivo é usado no caminho e não há validação demonstrada de tamanho, extensão, MIME, conteúdo ou tratamento de nomes potencialmente perigosos.


* **Credenciais de demonstração:** o startup cria `admin` e `dev.junior` com senha `123456`.



### Melhorias futuras

1. Expandir a gestão centralizada de variáveis de ambiente (já aplicada no Render) para arquivos locais de configuração separados por ambiente (ex: `.env.development`, `.env.production`).
2. Adotar Alembic para migrações e migrar do SQLite para o PostgreSQL gerenciado nos ambientes de produção.


3. Criar uma camada de serviços e políticas de autorização, validando proprietário e permissão em cada operação sensível.


4. Implementar upload seguro com nomes gerados pelo servidor, validação de MIME e tamanho, armazenamento externo ou volume dedicado e controle de acesso.


5. Substituir o administrador identificado por string por papéis/roles persistidos e auditáveis.


6. Aumentar a cobertura da suíte atual de testes automatizados (Pytest e Vitest), incluindo testes de integração do fluxo de login e validação de contratos.
7. Criar logs estruturados, métricas de latência/erro, alertas e endpoint de prontidão que valide o banco.


8. Melhorar a experiência de sessão com tratamento centralizado de HTTP 401, expiração controlada e, conforme o modelo de ameaça, cookies HttpOnly e proteção CSRF.