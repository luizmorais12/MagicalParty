-- ========================================================
-- SCRIPT RÁPIDO PARA CORREÇÃO DE ERRO 42501 NO SUPABASE
-- 15 Anos Márcia Gorete — A Princesa e o Sapo
-- ========================================================
-- INSTRUÇÕES:
-- 1. Abra o painel do seu projeto no Supabase (https://supabase.com/dashboard)
-- 2. No menu esquerdo, clique em "SQL Editor"
-- 3. Clique em "+ New Query"
-- 4. Cole todo este código abaixo e clique no botão verde "Run" (Executar)
-- ========================================================

-- 1. Liberar todas as tabelas para acesso pela chave pública (anon) e autenticada

-- GUESTS (Convidados RSVP)
ALTER TABLE IF EXISTS guests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Inserção pública de RSVP" ON guests;
DROP POLICY IF EXISTS "Controle total de convidados por administradores" ON guests;
DROP POLICY IF EXISTS "Leitura pública de convidados" ON guests;
DROP POLICY IF EXISTS "Acesso total aos convidados" ON guests;
DROP POLICY IF EXISTS "Permitir tudo em guests" ON guests;
CREATE POLICY "Permitir tudo em guests" ON guests FOR ALL TO public USING (true) WITH CHECK (true);

-- MESSAGES (Livro de Visitas / Mural)
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Inserção pública de mensagens" ON messages;
DROP POLICY IF EXISTS "Leitura pública de mensagens aprovadas" ON messages;
DROP POLICY IF EXISTS "Moderação total de mensagens por administradores" ON messages;
DROP POLICY IF EXISTS "Acesso total a mensagens" ON messages;
DROP POLICY IF EXISTS "Permitir tudo em messages" ON messages;
CREATE POLICY "Permitir tudo em messages" ON messages FOR ALL TO public USING (true) WITH CHECK (true);

-- SETTINGS (Configurações)
ALTER TABLE IF EXISTS settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de configurações" ON settings;
DROP POLICY IF EXISTS "Modificação apenas para administradores" ON settings;
DROP POLICY IF EXISTS "Acesso total a configurações" ON settings;
DROP POLICY IF EXISTS "Permitir tudo em settings" ON settings;
CREATE POLICY "Permitir tudo em settings" ON settings FOR ALL TO public USING (true) WITH CHECK (true);

-- GALLERY (Galeria de Fotos)
ALTER TABLE IF EXISTS gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de galeria" ON gallery;
DROP POLICY IF EXISTS "Controle total de galeria por administradores" ON gallery;
DROP POLICY IF EXISTS "Acesso total a galeria" ON gallery;
DROP POLICY IF EXISTS "Permitir tudo em gallery" ON gallery;
CREATE POLICY "Permitir tudo em gallery" ON gallery FOR ALL TO public USING (true) WITH CHECK (true);

-- TIMELINE (Cronograma)
ALTER TABLE IF EXISTS timeline ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública do cronograma" ON timeline;
DROP POLICY IF EXISTS "Controle total do cronograma por administradores" ON timeline;
DROP POLICY IF EXISTS "Acesso total ao cronograma" ON timeline;
DROP POLICY IF EXISTS "Permitir tudo em timeline" ON timeline;
CREATE POLICY "Permitir tudo em timeline" ON timeline FOR ALL TO public USING (true) WITH CHECK (true);

-- GIFTS (Presentes)
ALTER TABLE IF EXISTS gifts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de presentes" ON gifts;
DROP POLICY IF EXISTS "Atualização pública de reservas de presentes" ON gifts;
DROP POLICY IF EXISTS "Controle total de presentes por administradores" ON gifts;
DROP POLICY IF EXISTS "Acesso total a presentes" ON gifts;
DROP POLICY IF EXISTS "Permitir tudo em gifts" ON gifts;
CREATE POLICY "Permitir tudo em gifts" ON gifts FOR ALL TO public USING (true) WITH CHECK (true);

-- VIDEOS (Retrospectiva)
ALTER TABLE IF EXISTS videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de vídeos" ON videos;
DROP POLICY IF EXISTS "Controle total de vídeos por administradores" ON videos;
DROP POLICY IF EXISTS "Permitir tudo em videos" ON videos;
CREATE POLICY "Permitir tudo em videos" ON videos FOR ALL TO public USING (true) WITH CHECK (true);

-- MUSIC (Músicas)
ALTER TABLE IF EXISTS music ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de músicas" ON music;
DROP POLICY IF EXISTS "Controle total de músicas por administradores" ON music;
DROP POLICY IF EXISTS "Permitir tudo em music" ON music;
CREATE POLICY "Permitir tudo em music" ON music FOR ALL TO public USING (true) WITH CHECK (true);

-- 2. Conceder permissões explícitas no PostgreSQL
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
