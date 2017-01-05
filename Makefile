BIN := node_modules/.bin
TYPESCRIPT := $(shell jq -r '.files[]' tsconfig.json | grep -Fv .d.ts)
TYPESCRIPT_BASENAMES := $(basename $(TYPESCRIPT))

all: $(TYPESCRIPT_BASENAMES:%=%.js) build/bundle.js .gitignore .npmignore

$(BIN)/tsc $(BIN)/webpack:
	npm install

.gitignore: tsconfig.json
	echo $(TYPESCRIPT_BASENAMES:%=%.js) $(TYPESCRIPT_BASENAMES:%=%.d.ts) | tr ' ' '\n' > $@

.npmignore: tsconfig.json
	echo $(TYPESCRIPT) Makefile tsconfig.json webpack-dev-server.js webpack.config.js | tr ' ' '\n' > $@

%.js: %.ts $(BIN)/tsc
	$(BIN)/tsc

%.js: %.tsx $(BIN)/tsc
	$(BIN)/tsc

dev:
	(\
   NODE_ENV=development PORT=8248 node webpack-dev-server.js & \
   $(BIN)/tsc --watch & \
   wait)

build/bundle.js: webpack.config.js $(TYPESCRIPT_BASENAMES:%=%.js)
	NODE_ENV=production $(BIN)/webpack --config $<

clean:
	# deleting intermediate TypeScript compile output
	rm -f $(TYPESCRIPT_BASENAMES:%=%.js)
