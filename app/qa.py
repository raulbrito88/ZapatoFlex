import asyncio
import httpx
import time

BASE_URL = "https://claudia-boutique.vercel.app"

ESCENARIOS = [
    "/tienda",
    "/tienda?color=1",
    "/tienda?marca=1&categoria=1",
    "/api/colores",
    "/api/marcas",
    "/api/tallas",
    "/api/categorias",
]

async def request_worker(client: httpx.AsyncClient, url: str, resultados: list):
    inicio = time.monotonic()
    try:
        resp = await client.get(url, timeout=10.0)
        duracion = (time.monotonic() - inicio) * 1000
        resultados.append({
            "url": url,
            "status": resp.status_code,
            "ms": round(duracion, 2),
            "ok": resp.status_code == 200
        })
    except Exception as e:
        resultados.append({"url": url, "status": 0, "ms": 9999, "ok": False})

async def simular_carga(n_usuarios: int):
    resultados = []
    async with httpx.AsyncClient() as client:
        tareas = []
        for i in range(n_usuarios):
            url = BASE_URL + ESCENARIOS[i % len(ESCENARIOS)]
            tareas.append(request_worker(client, url, resultados))
        await asyncio.gather(*tareas)
    return resultados

async def main():
    # Verificar conectividad antes de empezar
    print(f"Probando conexión a {BASE_URL} ...")
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(BASE_URL + "/api/categorias", timeout=10.0)
            print(f"Conexión OK — status {r.status_code}\n")
    except Exception as e:
        print(f"ERROR: No se pudo conectar a {BASE_URL}")
        print(f"Detalle: {e}")
        print("Verifica que la URL sea correcta y el sitio esté desplegado.")
        return

    for n in [5, 10, 25, 50]:
        print(f"=== {n} usuarios concurrentes ===")
        inicio = time.monotonic()
        resultados = await simular_carga(n)
        total = (time.monotonic() - inicio) * 1000
        exitosos = sum(1 for r in resultados if r["ok"])
        tiempos = [r["ms"] for r in resultados if r["ok"]]
        fallidos = [r for r in resultados if not r["ok"]]

        print(f"  Exitosos      : {exitosos}/{n}")
        print(f"  Tiempo total  : {total:.0f} ms")

        if tiempos:
            print(f"  Promedio resp : {sum(tiempos)/len(tiempos):.0f} ms")
            print(f"  Máximo resp   : {max(tiempos):.0f} ms")
            print(f"  Mínimo resp   : {min(tiempos):.0f} ms")
        else:
            print("  Sin respuestas exitosas en este escenario")

        if fallidos:
            print(f"  Fallidos      : {len(fallidos)} requests")
            for f in fallidos[:3]:
                print(f"    - {f['url']} → status {f['status']}")
        print()

asyncio.run(main())
