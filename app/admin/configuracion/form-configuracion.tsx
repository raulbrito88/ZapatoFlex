"use client";

import { useState, useRef } from "react";
import type { ConfiguracionSitio } from "@prisma/client";
import { actualizarConfiguracion } from "@/app/actions/configuracion";

export function FormConfiguracion({ config }: { config: ConfiguracionSitio }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState(config.logoUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setLogoUrl(data.url);
      } else {
        setError(data.error || "Error al subir logo");
      }
    } catch {
      setError("Error al subir logo");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    formData.set("logoUrl", logoUrl);
    const res = await actualizarConfiguracion(null, formData);
    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess("Configuración guardada correctamente.");
    }
  }

  return (
    <form action={submit}>
      <div className="form-group">
        <label>Nombre del sitio</label>
        <input name="nombreSitio" defaultValue={config.nombreSitio ?? "ZapatoFlex"} required />
        <small className="text-muted">Aparece en el asunto y remitente de los correos electrónicos.</small>
      </div>
      <div className="form-group">
        <label>Título principal (home)</label>
        <input name="heroTitulo" defaultValue={config.heroTitulo} required />
      </div>
      <div className="form-group">
        <label>Descripción principal (home)</label>
        <textarea
          name="heroDescripcion"
          rows={2}
          defaultValue={config.heroDescripcion}
          required
        />
      </div>
      <div className="form-group">
        <label>Color principal (botones y precios)</label>
        <input
          name="colorPrimario"
          type="text"
          defaultValue={config.colorPrimario}
          placeholder="#6366f1"
          required
        />
        <small className="text-muted">
          Usa un color en formato hexadecimal, por ejemplo: #e11d48
        </small>
      </div>

      <div className="form-group">
        <label>Logo (navbar)</label>
        {logoUrl && (
          <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <img
              src={logoUrl}
              alt="Logo actual"
              style={{ height: 40, objectFit: "contain" }}
            />
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setLogoUrl("")}
            >
              Quitar logo
            </button>
          </div>
        )}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleUpload}
          />
          <span className="text-muted">
            Se recomienda un PNG horizontal con fondo transparente.
          </span>
        </div>
      </div>

      <div className="form-group">
        <label>Número de WhatsApp (contacto)</label>
        <input
          name="whatsappNumero"
          defaultValue={(config as any).whatsappNumero ?? ""}
          placeholder="Ej: 573001234567 (con código de país, sin +)"
        />
        <small className="text-muted">Deja vacío para ocultar el botón flotante.</small>
      </div>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="text-muted">{success}</p>}

      <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
        {loading ? "Guardando..." : "Guardar configuración"}
      </button>
    </form>
  );
}

