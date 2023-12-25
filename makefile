start:
	docker-compose up
npm-install:
	docker exec -it backend-app-1 npm install
migration-generate:
	npx typeorm-ts-node-esm migration:generate ./src/migrations/$(name) -d ./src/data-source.ts
migrate:
	npx typeorm-ts-node-commonjs migration:run -d src/data-source.ts
migration-revert:
	npx typeorm-ts-node-commonjs migration:revert -d src/data-source.ts
hard-restart:
	docker stop backend-app-1 || true
	docker rm backend-app-1 || true
	docker rmi backend-app || true
	docker build -t backend-app .
	docker run --name backend-app-1 backend-app