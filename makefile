npm-install:
	docker exec -it backend-app-1 npm install
migration-generate:
	npx typeorm-ts-node-esm migration:generate ./src/migrations/$(name) -d ./src/data-source.ts
migrate:
	npx typeorm-ts-node-commonjs migration:run -d src/data-source.ts
migration-revert:
	npx typeorm-ts-node-commonjs migration:revert -d src/data-source.ts
