
-- ============================================
-- MEDSTOCK - CORE SERVICE
-- Migration 001: Initial database schema
-- PostgreSQL 16
-- ============================================

BEGIN;

-- ============================================
-- 1. MEDICAMENTOS
-- ============================================

CREATE TABLE public.medicamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nome VARCHAR(150) NOT NULL,

    principio_ativo VARCHAR(150) NOT NULL,

    apresentacao VARCHAR(100) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================
-- 2. LOTES
-- ============================================

CREATE TABLE public.lotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    medicamento_id UUID NOT NULL,

    numero_lote VARCHAR(100) NOT NULL,

    data_validade DATE NOT NULL,

    quantidade_atual INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT lotes_quantidade_atual_check
        CHECK (quantidade_atual >= 0),

    CONSTRAINT lotes_medicamento_id_numero_lote_key
        UNIQUE (medicamento_id, numero_lote),

    CONSTRAINT lotes_medicamento_id_fkey
        FOREIGN KEY (medicamento_id)
        REFERENCES public.medicamentos(id)
);

-- ============================================
-- 3. MOVIMENTACOES DE ESTOQUE
-- ============================================

CREATE TABLE public.movimentacoes_estoque (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    lote_id UUID NOT NULL,

    tipo VARCHAR(7) NOT NULL,

    quantidade INTEGER NOT NULL,

    criada_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT movimentacoes_estoque_quantidade_check
        CHECK (quantidade > 0),

    CONSTRAINT movimentacoes_estoque_tipo_check
        CHECK (tipo IN ('ENTRADA', 'SAIDA')),

    CONSTRAINT movimentacoes_estoque_lote_id_fkey
        FOREIGN KEY (lote_id)
        REFERENCES public.lotes(id)
);

-- ============================================
-- 4. INDICES
-- ============================================

CREATE INDEX idx_movimentacoes_lote_data
ON public.movimentacoes_estoque (
    lote_id,
    criada_em DESC
);

COMMIT;
