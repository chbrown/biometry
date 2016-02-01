BIN := node_modules/.bin
TYPESCRIPT := $(shell jq -r '.files[]' tsconfig.json | grep -Fv .d.ts)

all: build/bundle.js .npmignore

$(BIN)/tsc $(BIN)/webpack:
	npm install

.npmignore: tsconfig.json
	echo $(TYPESCRIPT) Makefile tsconfig.json webpack-dev-server.js webpack.config.js | tr ' ' '\n' > $@

%.js: %.ts $(BIN)/tsc
	$(BIN)/tsc

dev:
	PORT=8248 node webpack-dev-server.js

build/bundle.js: webpack.config.js index.jsx $(wildcard components/*.jsx) $(TYPESCRIPT)
	NODE_ENV=production $(BIN)/webpack --config $<

clean:
	# deleting intermediate TypeScript compile output
	rm -f $(TYPESCRIPT:%.ts=%.js)
