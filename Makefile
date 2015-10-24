BIN := node_modules/.bin
DTS := async/async moment/moment-node react/react react-router/react-router redux/redux

all: build/bundle.js type_declarations

type_declarations: $(DTS:%=type_declarations/DefinitelyTyped/%.d.ts)
type_declarations/DefinitelyTyped/%:
	mkdir -p $(@D)
	curl -s https://raw.githubusercontent.com/borisyankov/DefinitelyTyped/master/$* > $@

$(BIN)/tsc $(BIN)/webpack:
	npm install

%.min.js: %.js
	closure-compiler --language_in ECMASCRIPT5 --warning_level QUIET $< >$@

%.js: %.ts type_declarations $(BIN)/tsc
	$(BIN)/tsc

dev:
	PORT=8248 node webpack-dev-server.js

build/bundle.js: webpack.config.js app.jsx components/RecentActions.jsx components/MetricsTable.jsx api.ts operations.ts store.ts
	NODE_ENV=production $(BIN)/webpack --config $<
