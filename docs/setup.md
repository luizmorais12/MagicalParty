# Guia de Configuração e Implantação Real 🏰

Este documento fornece as instruções passo a passo para conectar o sistema ao banco de dados Supabase e realizar a implantação na Vercel ou Netlify.

---

## 🗄️ 1. Configurando o Banco de Dados (Supabase)

### Passo A: Criar Projeto no Supabase
1. Acesse [Supabase.com](https://supabase.com) e crie uma conta gratuita.
2. Crie um novo projeto chamado **MagicalParty (Márcia Gorete - 15 Anos)**.
3. Escolha uma senha segura para o banco de dados PostgreSQL e selecione uma região próxima (ex: `South America (São Paulo)`).

### Passo B: Criar Tabelas e Dados Iniciais
1. No menu lateral do painel Supabase, acesse o **SQL Editor**.
2. Clique em **New Query**.
3. Abra o arquivo `/database/schema.sql` deste projeto, copie todo o código e cole no painel de SQL do Supabase. Clique em **Run**.
   * *Isso criará as tabelas e adicionará as informações básicas da festa, presentes e fotos iniciais.*

### Passo C: Configurar Segurança (Políticas RLS)
1. Crie outra Query no **SQL Editor**.
2. Abra o arquivo `/database/policies.sql` do projeto, copie o código e cole no painel SQL do Supabase. Clique em **Run**.
   * *Isso habilitará as políticas de segurança. Visitantes comuns só poderão ler presentes, fotos, cronograma e enviar confirmações de RSVP. Apenas o administrador autenticado poderá ver e gerenciar dados confidenciais.*

---

## 🔗 2. Conectando o Website ao Supabase

Você não precisa alterar uma única linha de código para fazer a conexão! O sistema possui um instalador dinâmico:
1. Abra o arquivo `admin.html` no seu navegador ou acesse o painel administrativo.
2. Faça o login utilizando as credenciais padrão de fábrica:
   - **Usuário:** `admin`
   - **Senha:** `castelo2026`
3. Acesse a aba **Configurações** no menu da lateral esquerda.
4. No Supabase, vá em **Project Settings > API** e copie:
   - `Project URL`
   - `anon / public` API Key
5. Cole esses valores nos respectivos campos **SUPABASE_URL** e **SUPABASE_ANON_KEY** no painel administrativo e clique em **Salvar Configurações**.
6. A página recarregará automaticamente e se conectará ao banco de dados Supabase real.

---

## 🚀 3. Hospedagem e Deploy na Nuvem (Vercel ou Netlify)

O sistema foi otimizado para servidores estáticos sem necessidade de compilação pesada (Vite/React), tornando o deploy instantâneo e 100% gratuito.

### Opção A: Deploy via Vercel (Recomendado)
1. Crie uma conta em [Vercel.com](https://vercel.com).
2. Instale a ferramenta CLI da Vercel ou conecte sua conta do GitHub.
3. Arraste a pasta do projeto para o painel ou use o comando:
   ```bash
   vercel
   ```
4. Siga as instruções no console para publicar.

### Opção B: Deploy via Netlify
1. Crie uma conta em [Netlify.com](https://netlify.com).
2. Acesse a aba **Sites** e clique em **Add new site > Deploy manually**.
3. Arraste e solte a pasta raiz do projeto.
4. O Netlify gerará um link público seguro (HTTPS) em segundos.

---

## 🧪 4. Desenvolvimento Local e Testes

Caso queira hospedar um servidor HTTP local para desenvolvimento rápido no seu computador:
- Se você tiver o NodeJS instalado, execute na pasta do projeto:
  ```bash
  npx serve
  ```
- Se tiver Python:
  ```bash
  python -m http.server 8000
  ```
- Ou utilize a extensão **Live Server** do VS Code.
