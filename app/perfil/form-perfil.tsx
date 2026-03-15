"use client";

import { useState, useTransition, useRef } from "react";
import { COLOMBIA } from "@/app/data/colombia";
import { actualizarPerfil } from "@/app/actions/perfil";

type UsuarioPerfil = {
  documento: string | null;
  telefono: string | null;
  departamento: string | null;
  municipio: string | null;
  direccionEnvio: string | null;
  complemento: string | null;
};

export function FormPerfil({ usuario }: { usuario: UsuarioPerfil }) {
  const [departamento, setDepartamento] = useState(usuario.departamento ?? "");
  const [municipio, setMunicipio] = useState(usuario.municipio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const municipios =
    COLOMBIA.find((d) => d.departamento === departamento)?.municipios ?? [];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await actualizarPerfil(formData);
      if (res?.error) setError(res.error);
      else setSuccess(true);
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Número de documento *</label>
        <input
          name="documento"
          defaultValue={usuario.documento ?? ""}
          placeholder="Cédula, pasaporte, etc."
          required
        />
      </div>

      <div className="form-group">
        <label>Número de contacto *</label>
        <input
          name="telefono"
          type="tel"
          defaultValue={usuario.telefono ?? ""}
          placeholder="Celular o teléfono de contacto"
          required
        />
      </div>

      <div className="form-group">
        <label>Departamento *</label>
        <select
          name="departamento"
          value={departamento}
          onChange={(e) => { setDepartamento(e.target.value); setMunicipio(""); }}
          required
        >
          <option value="">Seleccionar departamento...</option>
          {COLOMBIA.map((d) => (
            <option key={d.departamento} value={d.departamento}>
              {d.departamento}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Municipio *</label>
        <select
          name="municipio"
          value={municipio}
          onChange={(e) => setMunicipio(e.target.value)}
          disabled={!departamento}
          required
        >
          <option value="">Seleccionar municipio...</option>
          {municipios.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Dirección de envío *</label>
        <input
          name="direccionEnvio"
          defaultValue={usuario.direccionEnvio ?? ""}
          placeholder="Calle, carrera, número, barrio..."
          required
        />
      </div>

      <div className="form-group">
        <label>Complemento</label>
        <input
          name="complemento"
          defaultValue={usuario.complemento ?? ""}
          placeholder="Apto, torre, piso, referencia... (opcional)"
        />
      </div>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="text-muted">Perfil actualizado correctamente.</p>}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Guardando..." : "Guardar datos"}
      </button>
    </form>
  );
}
