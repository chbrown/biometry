BIN := node_modules/.bin

all: build/bundle.js

$(BIN)/tsc $(BIN)/webpack:
	npm install

%.js: %.ts $(BIN)/tsc
	$(BIN)/tsc

dev:
	PORT=8248 node webpack-dev-server.js

build/bundle.js: webpack.config.js app.jsx components/RecentActions.jsx components/MetricsTable.jsx api.ts operations.ts store.ts
	NODE_ENV=production $(BIN)/webpack --config $<

clean:
	# deleting intermediate TypeScript compile output
	rm -f api.js operations.js store.js
