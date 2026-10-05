# Memorial Técnico de Desenvolvimento

## 1. Tecnologias Utilizadas

## Execução dos testes

Os testes não são executados automaticamente ao salvar arquivos. Para executá-los manualmente:

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

### Execução conjunta

Em dois terminais separados:

```powershell
# Terminal 1
.\backend\venv\Scripts\python.exe -m pytest

# Terminal 2
Set-Location .\frontend
npm test
```

O BitDesk é uma aplicação web para gerenciamento de solicitações internas. O código está organizado em dois módulos principais dentro do projeto: `frontend` e `backend`.

### Frontend

- **JavaScript (ES Modules) e JSX**: linguagem utilizada para a lógica da interface e para a declaração dos componentes React.
- **React 19**: biblioteca principal de construção da interface, com componentes funcionais, hooks (`useState`, `useEffect`, `useContext`) e composição de telas.
- **Vite 8**: servidor de desenvolvimento, empacotador e ferramenta de build do frontend. O projeto utiliza `@vitejs/plugin-react`.
- **React Router DOM 7**: roteamento client-side entre login, dashboard, solicitações, calendário e perfil, incluindo rotas protegidas.
- **Axios**: cliente HTTP centralizado em `src/services/api.js`, com base URL da API e interceptor para anexar o token Bearer.
- **Tailwind CSS 4** e **@tailwindcss/vite**: estilização utilitária, incluindo variantes de tema claro/escuro e estados responsivos.
- **Lucide React**: biblioteca de ícones usada na navegação, formulários, indicadores e ações.
- **FullCalendar** (`@fullcalendar/react`, `@fullcalendar/core`, `@fullcalendar/daygrid` e `@fullcalendar/timegrid`): calendário mensal, semanal e diário para exibição dos prazos das solicitações.
- **react-hot-toast**: notificações de sucesso, erro e carregamento nas operações da aplicação.
- **PostCSS e Autoprefixer**: suporte ao processamento e à compatibilidade dos estilos.
- **ESLint**, `eslint-plugin-react-hooks` e `eslint-plugin-react-refresh`: linting e validações de práticas comuns do React.

### Backend

- **Python**: linguagem da API e das regras de negócio.
- **FastAPI**: framework para exposição da API REST, definição de rotas, dependências, documentação OpenAPI e serialização das respostas.
- **Uvicorn**: servidor ASGI previsto para execução da aplicação FastAPI.
- **Pydantic 2**: modelos de entrada e saída, validação de campos, limites de tamanho e conversão de dados.
- **pydantic-settings** e **python-dotenv**: dependências previstas para configuração por ambiente; a implementação atual lê as variáveis com `os.getenv` após `load_dotenv()`.
- **SQLAlchemy 2**: ORM e camada de acesso a dados, com modelos declarativos, relacionamentos, filtros e sessões transacionais.
- **SQLite**: banco de dados padrão configurado em `sqlite:///./bitdesk.db`, adequado ao desenvolvimento local e a instalações pequenas.
- **PostgreSQL**: banco compatível por configuração da `DATABASE_URL`, com suporte ao driver `psycopg2-binary`.
- **python-jose**: criação, assinatura e validação de tokens JWT usando o algoritmo configurável (por padrão, HS256).
- **Passlib e Bcrypt**: hashing e verificação das senhas, com o esquema Bcrypt.
- **python-multipart**: processamento de upload de arquivos para avatares.
- **StaticFiles do FastAPI**: publicação dos arquivos armazenados em `uploads/avatars`.
- **CORS Middleware do FastAPI**: permite a comunicação entre a origem do frontend e a API durante o desenvolvimento.

### Recursos funcionais e de infraestrutura presentes no código

- **Autenticação Bearer com JWT**, expiração configurável e senha armazenada somente em hash.
- **Persistência relacional** com as entidades `Usuario`, `Categoria`, `Solicitacao` e `SolicitacaoCompartilhamento`.
- **Upload de avatar** e disponibilização de arquivos estáticos.
- **Health check** na raiz da API.
- **Inicialização automática** das tabelas, categorias padrão e usuários de demonstração.
- **Scripts de desenvolvimento e build** no `package.json` (`dev`, `build`, `lint` e `preview`).


## 2. Justificativa Técnica

### React, JSX e Vite

- **Motivo da escolha:** a aplicação possui várias telas interativas, formulários, modais, filtros, estados de carregamento e navegação sem recarregar a página.
- **Benefícios:** React permite decompor a interface em componentes reutilizáveis, enquanto JSX mantém a estrutura visual próxima da lógica do componente. Vite fornece inicialização rápida, HMR e build enxuto.
- **Vantagens em relação a alternativas:** em comparação com páginas server-rendered sem uma camada de componentes, o React simplifica a atualização incremental da tela. Em relação a bundlers mais antigos, o Vite reduz o tempo de feedback durante o desenvolvimento.
- **Impacto:** a separação em `pages`, `components`, `context` e `services` facilita a manutenção e permite evoluir cada área sem concentrar todo o comportamento em uma única tela.

### React Router DOM

- **Motivo da escolha:** o sistema tem áreas públicas e autenticadas, com rotas distintas para dashboard, solicitações, calendário e perfil.
- **Benefícios:** permite navegação declarativa e a composição de `ProtectedRoute` com `Layout`, mantendo a autenticação e o shell visual centralizados.
- **Vantagens:** evita implementar manualmente o controle de histórico e de URLs, além de oferecer uma abordagem mais organizada que alternar telas por condicionais globais.
- **Impacto:** adicionar uma nova área autenticada exige principalmente registrar a rota e o componente, preservando a estrutura existente.

### FastAPI

- **Motivo da escolha:** a aplicação precisava de uma API REST pequena, com endpoints claros e validação automática.
- **Benefícios:** as dependências injetadas (`Depends`) centralizam a sessão do banco e a identificação do usuário atual; os modelos Pydantic geram contratos de entrada e saída; e a documentação OpenAPI é disponibilizada pelo framework.
- **Vantagens:** oferece menor quantidade de código estrutural que frameworks web mais pesados e possui bom desempenho assíncrono/ASGI. Para este escopo, também evita a necessidade de construir manualmente serialização e documentação.
- **Impacto:** as rotas estão separadas por domínio (`auth`, `solicitacoes`, `dashboard`, `auxiliares` e `usuarios`), o que facilita manutenção e futura extração de serviços.

### SQLAlchemy e banco relacional

- **Motivo da escolha:** solicitações, usuários, categorias e compartilhamentos possuem relações e integridade referencial.
- **Benefícios:** o ORM permite modelar relacionamentos, chaves estrangeiras, restrições de domínio e consultas filtradas sem acoplar toda a aplicação a SQL específico.
- **Vantagens:** a mesma camada suporta SQLite no desenvolvimento e PostgreSQL mediante configuração, diferentemente de uma solução puramente orientada a documentos que exigiria tratar manualmente várias relações.
- **Impacto:** o modelo relacional facilita consultas de indicadores, filtros por usuário e compartilhamento. A ausência de migrações formais, entretanto, limita a segurança de evoluções de schema em produção.

### Pydantic

- **Motivo da escolha:** os endpoints recebem dados potencialmente inválidos de formulários e precisam devolver respostas previsíveis.
- **Benefícios:** `Field` aplica mínimos, máximos e tipos para nomes, senhas, títulos, descrições, categorias e datas. Os schemas também impedem que o hash de senha seja exposto nas respostas.
- **Vantagens:** a validação é declarativa e integrada ao FastAPI, reduzindo validações repetitivas nas rotas.
- **Impacto:** os contratos explícitos tornam a API mais fácil de consumir e de testar; novos campos podem ser adicionados com impacto controlado.

### JWT, Passlib e Bcrypt

- **Motivo da escolha:** o frontend precisa autenticar chamadas HTTP independentes e manter o usuário identificado entre as telas.
- **Benefícios:** o backend emite um token com `sub` e `exp`, valida o Bearer em uma dependência única e nunca armazena a senha em texto puro. O Bcrypt adiciona custo computacional adequado ao armazenamento de credenciais.
- **Vantagens:** JWT não exige uma sessão armazenada no servidor para cada requisição, enquanto Bcrypt é mais apropriado para senha que hashes rápidos como SHA-256 sem salt.
- **Impacto:** simplifica o crescimento horizontal da API, mas exige gestão adequada de segredo, expiração, revogação e armazenamento do token para um ambiente de produção.

### Axios e contextos React

- **Motivo da escolha:** todas as telas precisam consumir a mesma API e compartilhar estado de autenticação e tema.
- **Benefícios:** o interceptor adiciona o token automaticamente; `AuthContext` centraliza login/logout e dados do usuário; `ThemeContext` persiste a preferência claro/escuro.
- **Vantagens:** reduz duplicação em comparação com chamadas `fetch` configuradas individualmente em cada componente.
- **Impacto:** a manutenção da URL, dos cabeçalhos e do comportamento de autenticação fica concentrada, embora a URL atual ainda esteja fixa no código.

### Tailwind CSS, FullCalendar, Lucide e react-hot-toast

- **Motivo da escolha:** são necessidades diretamente visíveis do produto: interface responsiva, calendário de prazos, ícones e feedback de operações.
- **Benefícios:** Tailwind acelera a composição visual e os estados dark mode; FullCalendar entrega componentes maduros de calendário; Lucide mantém ícones consistentes; e os toasts informam o resultado de ações assíncronas.
- **Vantagens:** evitam a implementação manual de calendário, sistema de ícones e camada de notificações.
- **Impacto:** aumentam a produtividade de interface, mas introduzem dependências que devem ser atualizadas e avaliadas quanto a bundle e compatibilidade.

## 3. Justificativa Conceitual

### Estrutura geral da aplicação

O sistema adota uma arquitetura cliente-servidor:

1. O frontend React é uma SPA executada pelo navegador.
2. O frontend envia requisições HTTP para a API FastAPI em `/api/v1`.
3. A API valida os dados, identifica o usuário por JWT, executa regras de negócio e persiste os dados por SQLAlchemy.
4. A API retorna JSON com schemas Pydantic; avatares são tratados como arquivos estáticos em `/uploads`.

O fluxo principal é: login -> armazenamento local do token e do usuário -> acesso às rotas protegidas -> consumo de solicitações, indicadores, categorias, usuários e perfil.

### Organização das camadas

- **Apresentação:** `frontend/src/pages` contém as telas; `frontend/src/components` contém layout, modais e proteção de rotas.
- **Estado de interface:** `frontend/src/context` mantém autenticação e tema.
- **Integração:** `frontend/src/services/api.js` concentra a instância Axios e o cabeçalho de autorização.
- **Entrada da aplicação:** `App.jsx` configura providers, roteamento e notificações.
- **API e transporte:** `backend/app/api/v1` contém os routers e endpoints por domínio.
- **Autorização compartilhada:** `backend/app/api/deps.py` resolve o usuário autenticado.
- **Regras de segurança:** `backend/app/core/security.py` encapsula hash de senha e JWT; `core/config.py` concentra configuração.
- **Persistência:** `backend/app/db/database.py` cria engine/sessões e `backend/app/db/models.py` define as entidades.
- **Contratos:** `backend/app/schemas` separa modelos de entrada, atualização, resumo e resposta.

Essa divisão é uma combinação de separação de responsabilidades, modularização por domínio e arquitetura em camadas.

### Modelagem de dados

O modelo é relacional:

- `Usuario` armazena identidade, login, hash da senha, data de criação e avatar.
- `Categoria` representa os grupos de atendimento, como TI, RH, Compras, Financeiro e Infraestrutura.
- `Solicitacao` referencia usuário e categoria, registra título, descrição, status, datas e prazo previsto.
- `SolicitacaoCompartilhamento` é uma entidade associativa com chave primária composta por solicitação e usuário, além da permissão `LEITURA` ou `EDICAO`.

As relações ORM usam `relationship` e `back_populates`. Restrições SQL limitam os status a `Aberto`, `Em Atendimento` e `Concluído`, e as permissões a `LEITURA` e `EDICAO`. Há exclusão em cascata para dependências associadas a solicitações e usuários. A inicialização cria as tabelas e inclui uma verificação pontual para adicionar a coluna de prazo em bases antigas.

### Padrões de projeto utilizados

- **Repository-like ORM access:** as rotas usam sessões SQLAlchemy para consultar e persistir entidades; não existe uma camada Repository formal separada.
- **Dependency Injection:** FastAPI injeta sessão de banco e usuário autenticado por `Depends`.
- **DTO/Schema:** os modelos Pydantic funcionam como contratos de entrada e saída, isolando o formato da API dos modelos ORM.
- **Provider/Context:** React Context fornece autenticação e tema para a árvore de componentes.
- **Guard/Protected Route:** `ProtectedRoute` redireciona visitantes não autenticados para `/login`.
- **Interceptor:** Axios injeta o Bearer token nas chamadas.
- **Router modular:** cada domínio da API possui seu próprio `APIRouter` e é incluído no `main.py`.

### Estratégia de autenticação e autorização

No cadastro, a senha é transformada em hash Bcrypt. No login, o backend compara o hash e retorna um JWT com o identificador do usuário no claim `sub` e uma data de expiração. Nas rotas que usam `obter_usuario_atual`, o token é decodificado e o usuário é buscado no banco.

No frontend, o token e os dados resumidos do usuário são guardados no `localStorage`. O interceptor do Axios envia `Authorization: Bearer <token>`, e o contexto controla a navegação da sessão. Há uma regra administrativa baseada no nome de usuário `admin` para listagem e exclusão de usuários.

### Comunicação frontend-backend

A comunicação é REST/JSON por HTTP, com Axios. O frontend usa endpoints para autenticação, indicadores, categorias, usuários, solicitações e perfil. Uploads utilizam `multipart/form-data`. O backend habilita CORS e publica os avatares por URL estática. Os filtros de solicitações são enviados como query parameters para status, categoria, busca, período e aba (`todas`, `minhas` ou `compartilhadas`).

### Organização funcional do frontend

As telas implementadas são:

- **Login:** autenticação e tratamento visual de erro.
- **Dashboard:** indicadores de total, abertas, em atendimento e concluídas.
- **Solicitações:** listagem, filtros, criação, edição, exclusão, alteração de status e compartilhamento.
- **Calendário:** exibição de solicitações que possuem prazo previsto.
- **Perfil:** alteração de nome, usuário, senha e avatar.

O `Layout` fornece navegação lateral, perfil resumido, logout, alternância de tema e área de conteúdo.

## 4. Análise Crítica

### Limitações da solução implementada

- **Configuração de desenvolvimento exposta no código:** a API usa `chave_secreta_padrao` quando `SECRET_KEY` não está definida, e o frontend utiliza `http://127.0.0.1:8000/api/v1` e `http://localhost:8000` em trechos distintos. Isso reduz portabilidade e não é adequado para produção.
- **CORS excessivamente permissivo:** `allow_origins=["*"]`, com credenciais habilitadas, deveria ser substituído por uma lista explícita de origens confiáveis.
- **Persistência local e migração:** SQLite é conveniente para desenvolvimento, mas o bootstrap com `Base.metadata.create_all` e um `ALTER TABLE` manual não substitui migrações versionadas.
- **Armazenamento do token:** `localStorage` é simples, porém aumenta o impacto de uma eventual vulnerabilidade XSS. Também não há fluxo explícito de refresh ou revogação de tokens.
- **Autorização incompleta em alguns fluxos:** a regra de usuário autenticado existe em boa parte das rotas, mas operações como upload de avatar não recebem a dependência de usuário atual. A alteração de status e o compartilhamento também não demonstram, no endpoint, uma verificação explícita de proprietário ou permissão de edição.
- **Upload de arquivos:** o nome original do arquivo é usado no caminho e não há validação demonstrada de tamanho, extensão, MIME, conteúdo ou tratamento de nomes potencialmente perigosos.
- **Credenciais de demonstração:** o startup cria `admin` e `dev.junior` com senha `123456`. Esse comportamento deve ser removido ou controlado por configuração antes de qualquer implantação real.
- **Tratamento de erros no frontend:** várias telas registram erros no console ou exibem toasts, mas não existe uma estratégia global para expiração do token, indisponibilidade da API ou repetição de requisições.
- **Escopo de permissões:** embora o compartilhamento possua `LEITURA` e `EDICAO`, as regras de aplicação dessas permissões não estão formalizadas em uma camada de autorização dedicada.

### Melhorias futuras

1. Introduzir variáveis de ambiente do frontend para API e origem de arquivos, com arquivos de configuração separados por ambiente.
2. Tornar `SECRET_KEY`, CORS, expiração e credenciais iniciais obrigatórios e seguros fora do código.
3. Adotar Alembic para migrações e PostgreSQL gerenciado em ambientes de produção.
4. Criar uma camada de serviços e políticas de autorização, validando proprietário e permissão em cada operação sensível.
5. Implementar upload seguro com nomes gerados pelo servidor, validação de MIME e tamanho, armazenamento externo ou volume dedicado e controle de acesso.
6. Substituir o administrador identificado por string por papéis/roles persistidos e auditáveis.
7. Adicionar testes unitários, testes de API com banco isolado, testes de integração do fluxo de login e testes de componentes/rotas do frontend.
8. Configurar CI para lint, build, testes e análise de dependências, além de um processo de deploy reproduzível com Docker ou serviço equivalente.
9. Criar logs estruturados, métricas de latência/erro, alertas e endpoint de prontidão que valide o banco.
10. Melhorar a experiência de sessão com tratamento centralizado de HTTP 401, expiração controlada e, conforme o modelo de ameaça, cookies HttpOnly e proteção CSRF.

### Requisitos que poderiam ser aperfeiçoados

- Definir formalmente a matriz de permissões: quem pode alterar status, editar, excluir e compartilhar uma solicitação.
- Especificar retenção, auditoria e histórico de mudanças de status e compartilhamentos.
- Definir limites de paginação, ordenação e tamanho de busca para evitar consultas e respostas excessivas.
- Especificar regras de data, fuso horário e prazo previsto, inclusive comportamento para datas vencidas.
- Definir requisitos de acessibilidade, compatibilidade de navegadores e política de imagens de avatar.
- Documentar o contrato de configuração, o processo de criação do primeiro administrador e a estratégia de backup/restauração.

### Decisões diferentes em um ambiente corporativo de produção

Em produção corporativa, eu manteria a separação React/FastAPI e os contratos Pydantic, mas substituiria o bootstrap local por configuração gerenciada, PostgreSQL com migrações, secrets manager, CORS restrito, HTTPS obrigatório, autenticação integrada ao diretório corporativo (quando aplicável), RBAC persistido e trilhas de auditoria. Também adicionaria pipeline de CI/CD, imagens imutáveis, observabilidade, backups testados, verificação de vulnerabilidades, testes automatizados e armazenamento de arquivos dedicado. O frontend deixaria de depender de URLs hardcoded, e a política de sessão seria revisada para reduzir exposição de tokens no navegador.
