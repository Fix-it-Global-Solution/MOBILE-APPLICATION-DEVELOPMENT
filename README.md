# Fix-It Mobile — Plataforma CitizenTech de Zeladoria Urbana Inteligente

Aplicação mobile oficial da plataforma **Fix-It**, desenvolvida em **React Native com Expo (SDK 58) e TypeScript** para a **Global Solution FIAP — Mobile Application Development (Turma 2TDSPF)**.

---

## 1. Visão Geral e Objetivo Principal

A manutenção da infraestrutura urbana em grandes centros enfrenta desafios crônicos: falta de padronização nos relatos de problemas viários, ausência de coordenadas geográficas exatas, dificuldade em priorizar ocorrências críticas e lentidão no encaminhamento às secretarias responsáveis.

O **Fix-It** tem como objetivo principal conectar cidadãos e gestão pública por meio de uma plataforma **CitizenTech de zeladoria urbana sustentável**. Através do aplicativo mobile, o munícipe reporta anomalias urbanas (como crateras no asfalto, iluminação pública inoperante, bueiros obstruídos, descarte irregular de resíduos, falhas semafóricas e danos em calçadas) enviando evidência fotográfica e coordenadas GPS de alta precisão.

Cada chamado registrado passa automaticamente por uma camada de **triagem inteligente via Inteligência Artificial (Spring AI integrado ao Google Gemini 1.5 Flash)**, que analisa a severidade do incidente, classifica o grau de criticidade, define o acordo de nível de serviço (SLA) e despacha a ordem de serviço de forma assíncrona via **RabbitMQ** para a secretaria municipal competente.

---

## 2. Integrantes da Equipe (Turma 2TDSPF)

| Nome Completo | RM | Turma | Responsabilidade Técnica |
| :--- | :---: | :---: | :--- |
| **Gabriel Sbrana Campos** | `565849` | 2TDSPF | Mobile Architecture & React Native Lead |
| **Moisés Waidemann Molinillo** | `563719` | 2TDSPF | Backend Java Spring Boot & Security JWT |
| **Richard Freitas** | `566127` | 2TDSPF | Spring AI (Gemini) & Mensageria RabbitMQ |
| **Thiago Rodrigues da Mota** | `563650` | 2TDSPF | Cloud DevOps, QA & Database Persistence |

- **Versão da Aplicação:** `1.0.0`
- **Commit Hash de Referência Oficial:** `9c13b49`
- **Vídeo de Demonstração (Global Solution):** [Assistir no YouTube](https://youtu.be/s3QerhZYuc4)
---

## 3. O Que Foi Desenvolvido

### 3.1. Autenticação Segura com JWT e Controle de Acesso (RBAC)
- **Persistência de Sessão (`AsyncStorage`):** Armazenamento local seguro do token JWT (`@FixIt:token`) e dos dados do usuário autenticado (`@FixIt:user`), permitindo restauração automática da sessão ao abrir o aplicativo.
- **Gerenciamento Global (`AuthContext`):** Exposição centralizada dos estados `user`, `token`, `loading` e `isAuthenticated`, além dos métodos `signIn`, `signUp` e `signOut`.
- **Proteção Estrita de Rotas (`AppNavigator`):** Separação arquitetural entre rotas públicas (`AuthStackNavigator`, acessível apenas quando `user == null`) e rotas privadas (`MainTabNavigator`, acessível exclusivamente mediante sessão JWT válida).
- **Resiliência para Avaliação:** Tratamento automático de transição entre `http://10.0.2.2:8080` (Android Emulator) e `http://localhost:8080` (iOS/Web), acompanhado de contingência integrada às contas oficiais do DataSeeder (`ROLE_CIDADAO` e `ROLE_GESTOR`) para garantir disponibilidade contínua durante os testes.

### 3.2. Camada de Serviço HTTP e Integração CRUD com Axios
- **Interceptors de Requisição (`api.ts`):** Injeção automática do cabeçalho `Authorization: Bearer <token>` em todas as chamadas destinadas à API REST.
- **Interceptors de Resposta (`api.ts`):** Detecção global de erros de rede com *retry* automático em host alternativo e tratamento de códigos `401 Unauthorized` e `403 Forbidden`, forçando o encerramento seguro da sessão caso o token expire.
- **Operações CRUD Completas (`ocorrenciaService.ts`):**
  - **Create:** Abertura de novas ocorrências georreferenciadas com validação de payload e tratamento de erros `400 Bad Request`.
  - **Read:** Listagem geral de incidentes urbanos para o painel/mapa e filtragem individual dos chamados pertencentes ao cidadão logado.
  - **Update (Edição):** Atualização completa dos dados da ocorrência (`PUT /api/v1/ocorrencias/{id}`), permitindo alterar título, descrição, categoria, nível de criticidade, endereço e status da ordem de serviço com sincronização imediata no painel e mapa.
  - **Delete (Cancelamento):** Exclusão/cancelamento de chamados abertos mediante confirmação explícita do usuário e validação de regra de negócio (permitido exclusivamente para ocorrências com status `ABERTO`).

### 3.3. Integração com Hardware Nativo (GPS, Câmera e Mapas)
- **Geolocalização (`expo-location`):** Solicitação formal de permissão (`requestForegroundPermissionsAsync`), leitura de `latitude` e `longitude` em tempo real (`getCurrentPositionAsync`), geocodificação reversa para preenchimento automático de endereço e exibição das coordenadas em campos somente leitura no formulário.
- **Captura Fotográfica (`expo-camera` e `expo-image-picker`):** Solicitação de permissões nativas de câmera e biblioteca de mídia, captura direta de fotos da anomalia viária com exibição de miniatura (preview) antes do envio e alertas instrutivos caso o usuário negue as permissões.
- **Mapa Interativo em Dark Mode (`react-native-maps`):** Renderização do componente `MapView` com estilização cartográfica JSON customizada em modo escuro (`DARK_MAP_STYLE`), marcadores (`Marker`) com cores dinâmicas baseadas no status e criticidade do chamado, e janelas de informação (`Callout`) estilizadas.

### 3.4. Design System Dark Theme OLED e Polimento de UI/UX
- **Paleta Escura Padronizada (`theme.ts`):** Construída sobre tons `#0A0A0A` e `#121212` para harmonizar com a identidade visual oficial da marca Fix-It e reduzir o consumo energético em telas OLED.
- **Superfícies e Inputs:** Cards e campos de entrada em `#1E1E1E` com bordas sutis `#333333`, tipografia principal em `#FFFFFF`, textos secundários em `#A1A1AA` e borda de foco ativa em verde esmeralda (`#00E676`).
- **Semântica Visual de Criticidade e SLA:**
  - `CRITICA` (`#EF4444` — Vermelho): Risco iminente de acidente grave ou bloqueio viário (SLA de até 4h).
  - `ALTA` (`#F97316` — Laranja): Comprometimento severo de segurança ou mobilidade (SLA de até 12h).
  - `MEDIA` (`#F59E0B` — Amarelo/Âmbar): Manutenção programada prioritária (SLA de até 48h).
  - `BAIXA` (`#38BDF8` — Azul Ciano): Zeladoria preventiva ou impacto localizado (SLA de até 5 dias).

---

## 4. Telas da Aplicação

1. **`LoginScreen` (`src/screens/LoginScreen.tsx`):** Autenticação JWT com validação de formato de e-mail e senha, bloqueio de campos durante submissão, indicador de carregamento (`ActivityIndicator`) e atalhos para preenchimento rápido das credenciais de demonstração (Cidadão e Gestor).
2. **`RegisterScreen` (`src/screens/RegisterScreen.tsx`):** Cadastro de novos munícipes com validação completa de campos obrigatórios, confirmação de senha coincidente, seleção de perfil RBAC (`ROLE_CIDADAO` ou `ROLE_GESTOR`) e login automático após o registro.
3. **`DashboardScreen` (`src/screens/DashboardScreen.tsx`):** Painel executivo com indicadores (KPIs) em tempo real, filtro por nível de criticidade, alternância entre visão híbrida, mapa interativo (`MapView`) e lista de ocorrências, além de tratamento de erros com botão de nova tentativa.
4. **`CreateOcorrenciaScreen` (`src/screens/CreateOcorrenciaScreen.tsx`):** Formulário completo para abertura de chamados contendo seleção de categoria, grau de criticidade, captura automática/manual de coordenadas GPS em campos de leitura e anexo fotográfico via câmera ou galeria.
5. **`MyOcorrenciasScreen` (`src/screens/MyOcorrenciasScreen.tsx`):** Gestão dos chamados abertos pelo usuário logado, busca textual por protocolo/endereço, modal detalhado com o parecer técnico gerado pela IA (Spring AI / Gemini) e cancelamento de ocorrências abertas com diálogo de confirmação (`Alert.alert`).
6. **`AboutScreen` (`src/screens/AboutScreen.tsx`):** Tela institucional contendo a identidade visual do Fix-It, propósito da solução CitizenTech, relação completa dos integrantes da turma `2TDSPF` com RM, tecnologias integradas, versão do aplicativo (`1.0.0`), hash do commit de referência (`6eeed36`) e botão de encerramento de sessão (`Logout`).

---

## 5. Arquitetura de Pastas (`src/`)

```text
MOBILE-APPLICATION-DEVELOPMENT/
├── assets/
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   ├── logo.png
│   └── splash-icon.png
├── src/
│   ├── components/
│   │   ├── CustomInput.tsx          # Input Dark Theme com estado de foco e alternância de senha
│   │   ├── FixItLogo.tsx            # Identidade visual oficial Fix-It
│   │   ├── OcorrenciaCard.tsx       # Card de ocorrência com barra de criticidade, parecer IA e ações
│   │   └── PrimaryButton.tsx        # Botões padronizados (primary, secondary, outline, danger)
│   ├── context/
│   │   ├── AuthContext.tsx          # Estado global de autenticação JWT e persistência AsyncStorage
│   │   └── OcorrenciaContext.tsx    # Estado global e sincronização CRUD das ocorrências
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Roteamento público (AuthStack) e protegido (MainTabNavigator)
│   ├── screens/
│   │   ├── LoginScreen.tsx          # Tela de autenticação do munícipe/gestor
│   │   ├── RegisterScreen.tsx       # Tela de cadastro de novo usuário
│   │   ├── DashboardScreen.tsx      # Painel de indicadores, Mapa Interativo Dark e listagem
│   │   ├── CreateOcorrenciaScreen.tsx # Abertura de chamado com GPS e Câmera/Galeria
│   │   ├── MyOcorrenciasScreen.tsx  # Consulta de chamados próprios, parecer IA e cancelamento
│   │   └── AboutScreen.tsx          # Tela institucional, equipe 2TDSPF, versão e commit hash
│   ├── services/
│   │   ├── api.ts                   # Cliente Axios configurado com Interceptors Request/Response
│   │   ├── authService.ts           # Integração com endpoints de login e registro + DataSeeder
│   │   ├── ocorrenciaService.ts     # Integração CRUD de ocorrências com fallback sincronizado
│   │   └── mockData.ts              # Metadados de categorias, SLAs, secretarias e carga inicial
│   ├── styles/
│   │   └── theme.ts                 # Tokens de cores Dark OLED, espaçamentos, sombras e tipografia
│   └── types/
│       └── index.ts                 # Contratos e interfaces TypeScript alinhados aos DTOs da API
├── App.tsx                          # Ponto de entrada com Providers globais e StatusBar
├── app.json                         # Configurações do Expo SDK 58 e permissões nativas
├── babel.config.js                  # Configuração do compilador Babel
├── index.ts                         # Registro do componente raiz no Expo
├── package.json                     # Dependências e scripts do projeto
└── tsconfig.json                    # Configuração TypeScript Strict Mode
```

---

## 6. Tecnologias e Dependências Principais

| Tecnologia / Biblioteca | Versão | Finalidade no Projeto |
| :--- | :---: | :--- |
| **React Native** | `0.88.1` | Framework base para desenvolvimento mobile multiplataforma |
| **Expo SDK** | `~58.0.26` | Toolchain e acesso às APIs nativas do sistema operacional |
| **TypeScript** | `~6.0.3` | Tipagem estática de contratos, DTOs, rotas e propriedades |
| **React Navigation** | `^6.1.18` | Navegação em pilha (`native-stack`) e abas inferiores (`bottom-tabs`) |
| **Axios** | `^1.7.7` | Cliente HTTP REST com interceptors de autenticação e tratamento de erros |
| **AsyncStorage** | `2.2.0` | Persistência local do token JWT e dados de sessão no dispositivo |
| **React Native Maps** | `1.20.1` | Renderização de mapas interativos com estilização JSON Dark Mode |
| **Expo Location** | `~58.0.22` | Captura de coordenadas GPS e geocodificação reversa de endereços |
| **Expo Camera** | `~58.0.18` | Gerenciamento de permissões e visor nativo de câmera |
| **Expo Image Picker** | `~58.0.10` | Captura fotográfica pela câmera do sistema e seleção via galeria |

---

## 7. Endpoints da API Backend Integrados

A camada de serviços (`src/services/api.ts`, `authService.ts` e `ocorrenciaService.ts`) está configurada para comunicação com a API REST nas seguintes rotas:

| Método | Endpoint | Descrição | Autenticação |
| :---: | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/login` | Autentica o usuário e retorna o token JWT, perfil RBAC e dados da conta | Pública |
| `POST` | `/api/v1/auth/registrar` | Registra um novo munícipe (`ROLE_CIDADAO` ou `ROLE_GESTOR`) | Pública |
| `GET` | `/api/v1/ocorrencias` | Lista as ocorrências urbanas georreferenciadas (suporta paginação) | Bearer JWT |
| `POST` | `/api/v1/ocorrencias` | Registra uma nova ocorrência com coordenadas GPS e foto | Bearer JWT |
| `PUT` | `/api/v1/ocorrencias/{id}` | Atualiza os dados, criticidade, categoria ou status de uma ocorrência | Bearer JWT |
| `DELETE` | `/api/v1/ocorrencias/{id}` | Cancela uma ocorrência existente (restrito ao status `ABERTO`) | Bearer JWT |

---

## 8. Como Executar o Projeto

### Pré-requisitos
- **Node.js** (versão 18 LTS ou superior)
- **npm** ou **yarn**
- **Android Studio** (para execução em Emulador Android) ou aplicativo **Expo Go** instalado no dispositivo físico

### Passo a Passo

1. Instale as dependências do projeto:
```bash
npm install
```

2. Verifique a integridade da tipagem TypeScript:
```bash
npm run typecheck
```

3. Inicie o servidor de desenvolvimento do Expo (recomenda-se o uso da flag `-c` na primeira execução para limpar o cache do bundler):
```bash
npx expo start -c
```

4. No terminal interativo do Expo:
   - Pressione **`a`** para abrir no **Android Emulator**.
   - Pressione **`w`** para abrir no navegador (**Expo Web**).
   - Ou escaneie o **QR Code** exibido utilizando o aplicativo **Expo Go**.

---

## 9. Credenciais Oficiais para Teste (DataSeeder)

Para facilitar a avaliação de todos os fluxos da aplicação (mesmo quando executada de forma independente do servidor backend local), a tela de login conta com botões de preenchimento automático para as duas contas oficiais do DataSeeder:

| Perfil de Acesso | E-mail | Senha | Role (RBAC) |
| :--- | :--- | :--- | :--- |
| **Cidadão (Munícipe)** | `cidadao@fixit.com` | `123456` | `ROLE_CIDADAO` |
| **Gestor Público** | `gestor@fixit.com` | `123456` | `ROLE_GESTOR` |
