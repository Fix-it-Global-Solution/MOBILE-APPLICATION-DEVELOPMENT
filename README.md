# Fix-It Mobile — Plataforma Inteligente de Zeladoria Urbana (CitizenTech)

Aplicativo mobile oficial da plataforma **Fix-It**, desenvolvido em **React Native + Expo (SDK 58) + TypeScript** para a **Global Solution FIAP (Turma 2TDSPF)**.

O **Fix-It** permite que cidadãos reportem incidentes urbanos (buracos na via, iluminação pública apagada, bueiros entupidos, descarte irregular e semáforos inoperantes) com geolocalização GPS e foto, acionando automaticamente a triagem técnica por Inteligência Artificial (**Spring AI + Google Gemini 1.5 Flash**) e o despacho assíncrono via **RabbitMQ**.

---

## 1. Integrantes da Equipe (Turma 2TDSPF)

| Nome Completo | RM | Turma | Papel no Projeto |
| :--- | :---: | :---: | :--- |
| **Gabriel Sbrana Campos** | `565849` | 2TDSPF | Mobile Architecture & React Native Lead |
| **Moisés Waidemann Molinillo** | `563719` | 2TDSPF | Backend Java Spring Boot & Security JWT |
| **Richard Freitas** | `566127` | 2TDSPF | Spring AI (Gemini) & Mensageria RabbitMQ |
| **Thiago Rodrigues da Mota** | `563650` | 2TDSPF | Cloud DevOps, QA & Database Persistence |

- **Commit de Referência Inicial:** `cb5f0a1`

---

## 2. Identidade Visual & Dark Theme OLED

O design do aplicativo foi construído rigorosamente sobre um **Dark Theme OLED (`#0A0A0A` / `#121212`)** para combinar perfeitamente com a logo preta minimalista oficial do Fix-It:

- **Fundo Principal (`background`):** `#0A0A0A` (OLED Black) e `#121212` (Preto Carvão)
- **Cards e Superfícies (`surface`):** `#1E1E1E` e `#252525` (`surfaceElevated`)
- **Cor Primária (`primary`):** `#00E676` (Verde Esmeralda moderno para ações e status concluído)
- **Cor de Destaque (`accent`):** `#38BDF8` (Azul Ciano para geolocalização e metadados técnicos)
- **Tipografia:** `#FFFFFF` (Branco puro) e `#A1A1AA` (Cinza claro)
- **Cores de Criticidade no Mapa e Dashboard:**
  - `CRITICA`: `#EF4444` (Vermelho Alerta — SLA 4h)
  - `ALTA`: `#F97316` (Laranja Intenso — SLA 12h)
  - `MEDIA`: `#F59E0B` (Âmbar — SLA 48h)
  - `BAIXA`: `#38BDF8` (Azul Ciano — SLA 5 dias)

---

## 3. Arquitetura de Pastas Modular (`src/`)

```text
MOBILE-APPLICATION-DEVELOPMENT/
├── assets/                          # Logo preta minimalista oficial e ícones Expo
├── src/
│   ├── components/                  # Componentes reutilizáveis estilizados
│   │   ├── CustomInput.tsx          # Input Dark com ícone, foco verde esmeralda e toggle de senha
│   │   ├── FixItLogo.tsx            # Componente da logo oficial com badge CitizenTech
│   │   ├── OcorrenciaCard.tsx       # Card de incidente com faixa de criticidade e parecer IA
│   │   └── PrimaryButton.tsx        # Botões (primary, secondary, outline, danger) com loading
│   ├── context/                     # Gerenciamento de Estado Global (Context API + AsyncStorage)
│   │   ├── AuthContext.tsx          # Autenticação JWT, sessão persistente, login/registro/logout
│   │   └── OcorrenciaContext.tsx    # Sincronização em tempo real dos chamados entre todas as telas
│   ├── navigation/                  # Configuração de Rotas (React Navigation)
│   │   └── AppNavigator.tsx         # AuthStack (Login/Register) + MainTabs (Dashboard/Create/My/About)
│   ├── screens/                     # 6 Telas Obrigatórias da Aplicação
│   │   ├── LoginScreen.tsx          # 1. Autenticação JWT com atalho de demonstração
│   │   ├── RegisterScreen.tsx       # 2. Cadastro de novo munícipe (ROLE_CIDADAO / ROLE_GESTOR)
│   │   ├── DashboardScreen.tsx      # 3. Painel de KPIs + Mapa Interativo Dark + Lista por criticidade
│   │   ├── CreateOcorrenciaScreen.tsx # 4. Abertura de chamado com GPS (expo-location) e Foto (câmera/galeria)
│   │   ├── MyOcorrenciasScreen.tsx  # 5. Meus chamados com modal de parecer IA e cancelamento (Delete)
│   │   └── AboutScreen.tsx          # 6. Sobre o App (Equipe, Turma 2TDSPF, Hash do Commit e Logout)
│   ├── services/                    # Integração HTTP Axios com Backend Spring Boot + Fallback Offline
│   │   ├── api.ts                   # Instância Axios com interceptor JWT Bearer
│   │   ├── authService.ts           # Serviços /api/v1/auth/login e /api/v1/auth/registrar
│   │   ├── ocorrenciaService.ts     # Serviços CRUD /api/v1/ocorrencias
│   │   └── mockData.ts              # Dados iniciais georreferenciados e metadados de SLA/Secretarias
│   ├── styles/
│   │   └── theme.ts                 # Paleta Dark Theme global, tipografia e tema do React Navigation
│   └── types/
│       └── index.ts                 # Contratos TypeScript alinhados aos DTOs do backend Java
├── App.tsx                          # Ponto de entrada com Providers e StatusBar light
├── app.json                         # Configuração Expo (Dark UI, permissões de Câmera e GPS)
├── package.json                     # Dependências do projeto
└── tsconfig.json                    # Configuração TypeScript Strict
```

---

## 4. Como Executar o Projeto

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor de desenvolvimento Expo
npx expo start
```

- Pressione `a` para abrir no **Android Emulator**, `i` para **iOS Simulator**, `w` para **Web**, ou escaneie o QR Code com o aplicativo **Expo Go** no seu smartphone.
- **Credenciais de Demonstração Rápida (DataSeeder Oficial — 1 clique na tela de Login):**
  - **Cidadão (`ROLE_CIDADAO`):** `cidadao@fixit.com` | Senha: `123456`
  - **Gestor (`ROLE_GESTOR`):** `gestor@fixit.com` | Senha: `123456`
