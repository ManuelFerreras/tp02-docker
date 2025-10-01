# estado de servicios

docker compose ps

# health de QA y PROD

curl http://localhost:8081/health
curl http://localhost:8082/health

# prueba de datos

curl -X POST http://localhost:8081/messages -H 'Content-Type: application/json' -d '{"content":"evidencia QA"}'
curl http://localhost:8081/messages

curl -X POST http://localhost:8082/messages -H 'Content-Type: application/json' -d '{"content":"evidencia PROD"}'
curl http://localhost:8082/messages

# persistencia (reinicio DB y ver datos)

docker compose restart db
curl http://localhost:8081/messages

# misma imagen (IDs iguales)

docker inspect -f '{{.Image}}' tp02-app-qa
docker inspect -f '{{.Image}}' tp02-app-prod

# volúmenes

docker volume ls
docker volume inspect tp02-docker-app_pgdata 2>/dev/null || true
