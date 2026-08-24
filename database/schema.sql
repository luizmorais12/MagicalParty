-- 15 Anos Márcia Gorete — A Princesa e o Sapo
-- Schema e Estrutura do Banco de Dados PostgreSQL (Supabase)

-- Habilitar extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABELA SETTINGS (Configurações Gerais do Evento)
-- ==========================================
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. TABELA GUESTS (Convidados RSVP)
-- ==========================================
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    guests_count INT NOT NULL DEFAULT 1,
    guest_names TEXT,
    adults_count INT NOT NULL DEFAULT 1,
    kids_count INT NOT NULL DEFAULT 0,
    message TEXT,
    obs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. TABELA MESSAGES (Livro de Visitas / Mensagens)
-- ==========================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. TABELA GIFTS (Lista de Presentes)
-- ==========================================
CREATE TABLE IF NOT EXISTS gifts (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    reserved_by VARCHAR(255),
    reserved_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 5. TABELA GALLERY (Galeria de Fotos)
-- ==========================================
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    caption TEXT,
    category VARCHAR(100) DEFAULT 'Ensaio',
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. TABELA VIDEOS (Retrospectiva)
-- ==========================================
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL DEFAULT 'youtube', -- 'youtube', 'vimeo', 'upload'
    url TEXT NOT NULL,
    thumbnail TEXT,
    title VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

-- ==========================================
-- 7. TABELA MUSIC (Música de Fundo)
-- ==========================================
CREATE TABLE IF NOT EXISTS music (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- ==========================================
-- 8. TABELA TIMELINE (Programação do Evento)
-- ==========================================
CREATE TABLE IF NOT EXISTS timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    time VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    order_index INT DEFAULT 0
);

-- ==========================================
-- 9. TABELA ADMINS (Credenciais Administrativas Alternativas)
-- ==========================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 10. DADOS INICIAIS (SEED DATA)
-- ==========================================

-- Sementes das Configurações Gerais
INSERT INTO settings (key, value) VALUES
('event_settings', '{
    "name": "Márcia Gorete do Carmo Medeiros",
    "date": "2026-10-03T20:00:00",
    "location": "Mansão JK - Rua Padre Eustáquio 660 - Biritiba, Poá - SP, 08562-400",
    "phrase": "Encontre sua estrela da noite e deixe a magia acontecer.",
    "pix_key": "marcia15anos@pix.com.br",
    "theme": "princess-and-the-frog"
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Sementes da Programação (Timeline)
INSERT INTO timeline (time, title, description, icon, order_index) VALUES
('20:00', 'Entrada Jazz Lounge', 'Recepção instrumental com jazz clássico de New Orleans dos anos 1920, luzes suaves e LEDs simulando vaga-lumes.', 'fas fa-music', 1),
('21:30', 'Banquete & Estação de Beignets', 'Jantar com culinária típica cajun e creole, além dos famosos Beignets da Tiana servidos com calda de chocolate quente.', 'fas fa-utensils', 2),
('23:00', 'Visual da Debutante (Jazz Era)', 'Entrada oficial de recepção de Márcia vestindo seu elegante look lilás e dourado no autêntico estilo anos 20.', 'fas fa-crown', 3),
('23:15', 'Valsa da Estrela (Verde-Sálvia)', 'Márcia dança a valsa principal com o clássico vestido rodado verde-sálvia sob a luz dos vaga-lumes.', 'fas fa-star', 4),
('23:45', 'Mesa de Doces Iluminada', 'Homenagens e parabéns ao redor da mesa repleta de folhagens, luzes suspensas e nenúfares lilases e brancas.', 'fas fa-heart', 5),
('00:00', 'Abertura da Pista de Jazz & Ritmos', 'Muita dança e comemoração pela madrugada com coquetéis mágicos e ritmos contagiantes.', 'fas fa-compact-disc', 6),
('04:00', 'Encerramento e Lembranças', 'Agradecimento especial e entrega de mimos de Nova Orleans para selar esta noite inesquecível.', 'fas fa-moon', 7)
ON CONFLICT DO NOTHING;

-- Sementes dos Presentes (Gifts)
INSERT INTO gifts (id, name, description, price, image_url, is_available) VALUES
('gift-1', 'Fragrância Imperial', 'Perfume sofisticado com notas de jasmim e lírio d''água para a debutante.', 350.00, 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=400&auto=format&fit=crop', true),
('gift-2', 'Brincos Dourados', 'Um detalhe banhado a ouro para complementar o visual do grande baile.', 280.00, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&auto=format&fit=crop', true),
('gift-3', 'Bolsa Tiracolo', 'Bolsa clutch elegante para ocasiões festivas e saídas inesquecíveis.', 180.00, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop', true),
('gift-4', 'Tiara de Lótus', 'Um adereço reluzente em formato de vitória-régia para coroar a noite.', 320.00, 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?q=80&w=400&auto=format&fit=crop', true),
('gift-5', 'Kit de Beleza', 'Paleta de cores elegantes e maquiagens finas para realçar seu brilho natural.', 150.00, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=400&auto=format&fit=crop', true),
('gift-6', 'Livro de Receitas da Tiana', 'Livro clássico com as melhores receitas cajun e creole de New Orleans.', 200.00, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop', true),
('gift-7', 'Câmera Instantânea', 'Para fotografar na hora os melhores momentos e guardar no mural físico.', 450.00, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=400&auto=format&fit=crop', true),
('gift-8', 'Experiência Dia de SPA', 'Um dia inteiro de massagens e tratamentos relaxantes antes do grande baile.', 500.00, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=400&auto=format&fit=crop', true)
ON CONFLICT DO NOTHING;

-- Sementes dos Vídeos da Retrospectiva
INSERT INTO videos (type, url, thumbnail, title, is_active) VALUES
('youtube', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'assets/img/WhatsApp%20Image%202026-08-24%20at%2000.01.40.jpeg', 'Uma História de Determinação - Márcia Gorete', true)
ON CONFLICT DO NOTHING;

-- Sementes das Músicas
INSERT INTO music (title, url, is_active) VALUES
('Quase Lá (Almost There) - Instrumental Bayou', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', true)
ON CONFLICT DO NOTHING;

-- Sementes da Galeria de Fotos
INSERT INTO gallery (url, caption, category, order_index) VALUES
('assets/img/WhatsApp%20Image%202026-08-24%20at%2000.01.40%20(1).jpeg', '', 'Debutante', 1),
('assets/img/WhatsApp%20Image%202026-08-24%20at%2000.01.40%20(2).jpeg', '', 'Debutante', 2),
('assets/img/WhatsApp%20Image%202026-08-24%20at%2000.01.40%20(3).jpeg', '', 'Debutante', 3),
('assets/img/WhatsApp%20Image%202026-08-24%20at%2000.01.41.jpeg', '', 'Debutante', 4),
('assets/img/WhatsApp%20Image%202026-08-24%20at%2000.01.41%20(1).jpeg', '', 'Debutante', 5),
('assets/img/WhatsApp%20Image%202026-08-24%20at%2000.01.41%20(2).jpeg', '', 'Debutante', 6)
ON CONFLICT DO NOTHING;

-- Semente do Administrador Fictício (admin / admin123)
INSERT INTO admins (username, password_hash) VALUES
('admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918') -- SHA256 para 'admin123'
ON CONFLICT (username) DO NOTHING;
