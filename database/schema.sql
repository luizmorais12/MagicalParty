-- 15 Anos Márcia Gorete — A Bela e a Fera
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
    "location": "Salão Imperial Maison D''Or - Av. dos Nobres Castelos, 1500 - Jardim das Rosas, São Paulo - SP",
    "phrase": "Uma noite encantada espera por você no baile real.",
    "pix_key": "marcia15anos@pix.com.br",
    "theme": "beauty-and-the-beast"
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Sementes da Programação (Timeline)
INSERT INTO timeline (time, title, description, icon, order_index) VALUES
(''20:00'', ''Recepção Real'', ''Abertura dos portões do castelo para acolhimento dos convidados com música suave instrumental.'', ''fas fa-door-open'', 1),
(''21:30'', ''Jantar Imperial'', ''Banquete especialmente preparado com os melhores sabores para celebrar esta data especial.'', ''fas fa-utensils'', 2),
(''23:00'', ''Entrada da Debutante'', ''O momento mais esperado da noite: a apresentação de Márcia em seu belo vestido de gala.'', ''fas fa-crown'', 3),
(''23:15'', ''A Grande Valsa'', ''Márcia dança a valsa tradicional no centro do salão com seu pai e príncipes, abrindo a pista.'', ''fas fa-rose'', 4),
(''23:45'', ''Homenagens e Parabéns'', ''Momento de emoção com retrospectiva, discursos e o tradicional parabéns ao redor do bolo real.'', ''fas fa-heart'', 5),
(''00:00'', ''Abertura da Pista'', ''Muita música, dança e alegria. A comemoração continua pela madrugada com coquetéis mágicos.'', ''fas fa-music'', 6),
(''04:00'', ''Encerramento do Conto'', ''Agradecimento final e despedida dos convidados com lembranças especiais do castelo.'', ''fas fa-moon'', 7)
ON CONFLICT DO NOTHING;

-- Sementes dos Presentes (Gifts)
INSERT INTO gifts (id, name, description, price, image_url, is_available) VALUES
(''gift-1'', ''Fragrância Imperial'', ''Perfume sofisticado com notas florais que combinam com o frescor de uma princesa.'', 350.00, ''https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=400&auto=format&fit=crop'', true),
(''gift-2'', ''Brincos Dourados'', ''Um detalhe banhado a ouro para complementar o visual mágico do grande baile.'', 280.00, ''https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&auto=format&fit=crop'', true),
(''gift-3'', ''Bolsa Tiracolo'', ''Bolsa clutch elegante para ocasiões festivas e saídas inesquecíveis.'', 180.00, ''https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop'', true),
(''gift-4'', ''Sapato de Cristal'', ''Salto moderno e confortável para dançar a valsa e aproveitar a festa ao máximo.'', 320.00, ''https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop'', true),
(''gift-5'', ''Kit de Beleza'', ''Paleta de cores elegantes e maquiagens finas para realçar seu brilho natural.'', 150.00, ''https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=400&auto=format&fit=crop'', true),
(''gift-6'', ''Biblioteca Clássica'', ''Coleção de livros encadernados de romance e contos de fadas medievais.'', 200.00, ''https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop'', true),
(''gift-7'', ''Câmera Instantânea'', ''Para fotografar na hora os melhores momentos e guardar no mural físico.'', 450.00, ''https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=400&auto=format&fit=crop'', true),
(''gift-8'', ''Experiência Dia de SPA'', ''Um dia inteiro de massagens e tratamentos relaxantes antes do grande baile.'', 500.00, ''https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=400&auto=format&fit=crop'', true)
ON CONFLICT DO NOTHING;

-- Sementes dos Vídeos da Retrospectiva
INSERT INTO videos (type, url, thumbnail, title, is_active) VALUES
(''youtube'', ''https://www.youtube.com/embed/dQw4w9WgXcQ'', ''https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=600&auto=format&fit=crop'', ''Uma História de Encantamento - Márcia Gorete'', true)
ON CONFLICT DO NOTHING;

-- Sementes das Músicas
INSERT INTO music (title, url, is_active) VALUES
(''Bela e a Fera - Clássico Instrumental'', ''https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'', true)
ON CONFLICT DO NOTHING;

-- Sementes da Galeria de Fotos
INSERT INTO gallery (url, caption, category, order_index) VALUES
(''https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop'', ''Um ensaio sob a luz suave do entardecer'', ''Ensaio'', 1),
(''https://images.unsplash.com/photo-1549417229-aa67d3263c09?q=80&w=600&auto=format&fit=crop'', ''Momentos de pura felicidade e sonhos'', ''Ensaio'', 2),
(''https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop'', ''A elegância de um dia inesquecível'', ''Debutante'', 3),
(''https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop'', ''A rosa encantada reflete sua beleza e brilho'', ''Infância'', 4),
(''https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop'', ''Caminhos dourados de contos de fadas'', ''Ensaio'', 5),
(''https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop'', ''À espera de uma noite espetacular'', ''Debutante'', 6)
ON CONFLICT DO NOTHING;

-- Semente do Administrador Fictício (admin / admin123)
INSERT INTO admins (username, password_hash) VALUES
(''admin'', ''8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'') -- SHA256 para ''admin123''
ON CONFLICT (username) DO NOTHING;
