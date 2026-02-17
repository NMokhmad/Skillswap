-- Migration V2 : nouveaux champs pour le système de notifications
-- À exécuter sur une base existante (en production)

BEGIN;

-- Ajout des colonnes manquantes à la table notification
ALTER TABLE "notification"
    ADD COLUMN IF NOT EXISTS "is_read" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "related_entity_type" TEXT,
    ADD COLUMN IF NOT EXISTS "related_entity_id" INT,
    ADD COLUMN IF NOT EXISTS "action_url" TEXT;

-- Rendre type_notification et content NOT NULL (si pas déjà le cas)
ALTER TABLE "notification"
    ALTER COLUMN "type_notification" SET NOT NULL,
    ALTER COLUMN "content" SET NOT NULL;

COMMIT;
