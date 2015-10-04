BIN := node_modules/.bin
DTS := async/async moment/moment-node react/react react/react-addons react-router/react-router redux/redux

all: build/bundle.js type_declarations

.INTERMEDIATE: img/favicon-16.png img/favicon-32.png
img/favicon-%.png: img/favicon.psd
	convert $<[0] -resize $*x$* $@
img/favicon.ico: img/favicon-16.png img/favicon-32.png
	convert $^ $@

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
	npm run dev

build/bundle.js: webpack.config.js app.jsx components/MetricsTable.jsx api.js operations.js store.js
	NODE_ENV=production $(BIN)/webpack --config $<
