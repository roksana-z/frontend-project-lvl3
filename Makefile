install: install-deps

run:
	webpack src/index.js 

install-deps:
	npm ci

test:
	npm test

lint:
	npx eslint .

publish:
	npm publish

.PHONY: test