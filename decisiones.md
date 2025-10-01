# decisiones.md – TP02 Docker

## Aplicación y tecnología

Se usó **Node.js con Express** por ser simple, ligero y estándar para pruebas rápidas.

## Imagen base

**node:22-alpine**, oficial, actualizada y liviana. Permite reducir tamaño y tiempos de build.

## Base de datos

**PostgreSQL 16**, por robustez y compatibilidad. Se crearon dos bases: `app_qa` y `app_prod`.

## Dockerfile

- `FROM node:22-alpine`: base mínima.
- `WORKDIR /app`: directorio de trabajo.
- `COPY package*.json` + `npm install --omit=dev`: dependencias de prod.
- `COPY . .`: código.
- `USER app`: menor privilegio.
- `EXPOSE 3000` + `HEALTHCHECK`: visibilidad y pruebas básicas.
- `CMD ["node", "server.js"]`: arranque de la app.

## QA y PROD

Misma imagen, distinta config por variables de entorno:

- `APP_ENV` (qa/prod)
- `DATABASE_URL` (bases separadas)
- `LOG_LEVEL` (debug/info)
- Puertos: QA en 8081, PROD en 8082.

## Persistencia

Volumen `pgdata` montado en `/var/lib/postgresql/data`. Garantiza que los datos sobrevivan a reinicios.

## Versionado y publicación

Tags: `dev` (desarrollo) y `v1.0` (estable). Convención SemVer para futuras versiones. Publicación en Docker Hub con `usuario/tp02-web:<tag>`.

## Evidencia

- QA: `curl http://localhost:8081/health` → `{status:"ok",env:"qa"}`
- PROD: `curl http://localhost:8082/health` → `{status:"ok",env:"prod"}`
- Conexión DB: `/db/ping` responde `db:"up"`.
- Datos persisten tras `docker compose restart db`.

## Problemas y soluciones

- **Conn refused DB** → esperar a que `db` esté healthy.
- **Puertos ocupados** → cambio a 8081/8082.
- **Permisos volumen (Mac)** → uso de named volumes.
- **Push fallido a Docker Hub** → corregido con `docker login` + `docker tag` correcto.
