-- AlterTable: agregar campos para recuperación de contraseña
ALTER TABLE "Usuario" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "Usuario" ADD COLUMN "resetTokenExpiry" DATETIME;

-- AlterTable: agregar nombre del sitio a configuración
ALTER TABLE "ConfiguracionSitio" ADD COLUMN "nombreSitio" TEXT NOT NULL DEFAULT 'ZapatoFlex';
