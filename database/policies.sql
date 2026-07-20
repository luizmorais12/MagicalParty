-- 15 Anos Márcia Gorete — A Bela e a Fera
-- Configuração de Row Level Security (RLS) e Políticas no Supabase

-- Habilitar RLS em todas as tabelas
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE music ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLÍTICAS PARA: SETTINGS
-- ==========================================
CREATE POLICY "Leitura pública de configurações" 
ON settings FOR SELECT 
USING (true);

CREATE POLICY "Modificação apenas para administradores" 
ON settings FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ==========================================
-- POLÍTICAS PARA: GUESTS (RSVP)
-- ==========================================
CREATE POLICY "Inserção pública de RSVP" 
ON guests FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Controle total de convidados por administradores" 
ON guests FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ==========================================
-- POLÍTICAS PARA: MESSAGES (Livro de Visitas)
-- ==========================================
CREATE POLICY "Inserção pública de mensagens" 
ON messages FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Leitura pública de mensagens aprovadas" 
ON messages FOR SELECT 
USING (approved = true);

CREATE POLICY "Moderação total de mensagens por administradores" 
ON messages FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ==========================================
-- POLÍTICAS PARA: GIFTS (Presentes)
-- ==========================================
CREATE POLICY "Leitura pública de presentes" 
ON gifts FOR SELECT 
USING (true);

CREATE POLICY "Atualização pública de reservas de presentes" 
ON gifts FOR UPDATE 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Controle total de presentes por administradores" 
ON gifts FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ==========================================
-- POLÍTICAS PARA: GALLERY, VIDEOS, MUSIC, TIMELINE
-- ==========================================
CREATE POLICY "Leitura pública de galeria" ON gallery FOR SELECT USING (true);
CREATE POLICY "Controle total de galeria por administradores" ON gallery FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Leitura pública de vídeos" ON videos FOR SELECT USING (true);
CREATE POLICY "Controle total de vídeos por administradores" ON videos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Leitura pública de músicas" ON music FOR SELECT USING (true);
CREATE POLICY "Controle total de músicas por administradores" ON music FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Leitura pública do cronograma" ON timeline FOR SELECT USING (true);
CREATE POLICY "Controle total do cronograma por administradores" ON timeline FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- POLÍTICAS PARA: ADMINS
-- ==========================================
CREATE POLICY "Acesso total a admins apenas para autenticados" 
ON admins FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
