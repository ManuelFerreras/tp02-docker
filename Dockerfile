# syntax=docker/dockerfile:1.7
FROM node:22-alpine

# Crear usuario no root y directorio de trabajo
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app

# Instalar dependencias de prod (sin dev) + curl para healthcheck
COPY package*.json ./
RUN npm install --omit=dev \
 && apk add --no-cache curl

# Copiar código
COPY . .

# Permisos y configuración
USER app
EXPOSE 3000
ENV PORT=3000

# Healthcheck a /health
HEALTHCHECK --interval=10s --timeout=2s --start-period=10s --retries=5 \
  CMD curl -f http://localhost:3000/health || exit 1

# Proceso principal
CMD ["node", "server.js"]
