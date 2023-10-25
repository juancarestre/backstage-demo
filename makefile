include .env

build-dev:
	yarn install
	yarn tsc
	npm run build:backend
	mkdir packages/backend/dist/skeleton packages/backend/dist/bundle \
    	&& tar xzf packages/backend/dist/skeleton.tar.gz -C packages/backend/dist/skeleton \
    	&& tar xzf packages/backend/dist/bundle.tar.gz -C packages/backend/dist/bundle
	cp ./packages/app/package.json ./packages/app/package.json.temp
	cp -r ./packages/backend/dist/bundle/ ./
	mv ./packages/app/package.json.temp ./packages/app/package.json
start-dev:
	docker-compose up
upgrade-backstage:
	yarn backstage-cli versions:bump