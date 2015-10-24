all: favicon.ico

.INTERMEDIATE: favicon-16.png favicon-32.png
favicon-%.png: favicon.psd
	convert $<[0] -resize $*x$* $@
favicon.ico: favicon-16.png favicon-32.png
	convert $^ $@

