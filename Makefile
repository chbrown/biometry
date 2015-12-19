BIN := node_modules/.bin
TYPESCRIPT := $(shell jq -r '.files[]' tsconfig.json | grep -v node_modules)
JAVASCRIPT := $(TYPESCRIPT:%.ts=%.js)

all: build/bundle.js

$(BIN)/tsc $(BIN)/webpack:
	npm install

%.js: %.ts $(BIN)/tsc
	$(BIN)/tsc

dev:
	PORT=8248 node webpack-dev-server.js

build/bundle.js: webpack.config.js index.jsx components/RecentActions.jsx components/MetricsTable.jsx $(TYPESCRIPT)
	NODE_ENV=production $(BIN)/webpack --config $<

clean:
	# deleting intermediate TypeScript compile output
	rm -f $(JAVASCRIPT)
