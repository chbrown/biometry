BIN := node_modules/.bin
DTS := async/async moment/moment-node react/react react/react-addons react-router/react-router redux/redux

all: build/bundle.js type_declarations

type_declarations: $(DTS:%=type_declarations/DefinitelyTyped/%.d.ts)
type_declarations/DefinitelyTyped/%:
	mkdir -p $(@D)
	curl -s https://raw.githubusercontent.com/borisyankov/DefinitelyTyped/master/$* > $@

$(BIN)/tsc $(BIN)/watsh:
	npm install

%.min.js: %.js
	closure-compiler --language_in ECMASCRIPT5 --warning_level QUIET $< >$@

%.js: %.ts type_declarations $(BIN)/tsc
	$(BIN)/tsc -m commonjs -t ES5 $<

dev:
	$(BIN)/watsh 'make site.css' site.less

build/bundle.js: webpack-production.config.js app.jsx
	NODE_ENV=production $(BIN)/webpack --config $<
