docker run -d --name my-postgres-container -p 9920:5432 -e POSTGRES_PASSWORD=accuvend -e POSTGRES_USER=accuvend -e POSTGRES_DB=accuvend postgres:13
docker run -d -p 6379:6379 --name local-redis  redis