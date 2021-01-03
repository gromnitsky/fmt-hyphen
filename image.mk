#!/usr/bin/make -f

# Require: ghostscript, paps, ImageMagick, netpbm-progs

$(if $(MAKECMDGOALS),,$(error Usage: cat file.txt | image.mk output.png))
w := 30
l := en-us

tmp := $(shell mktemp -u mk.XXXXXXXXXX).
self := $(realpath $(lastword $(MAKEFILE_LIST)))
mk := $(dir $(self))
SHELL := bash -o pipefail

images := $(tmp).images
$(images):
	$(mk)/fmt-hyphen -w$(w) -l$(l) | paps --font 'Monospace 10' | gs -q -sDEVICE=pnggray -dBATCH -dNOPAUSE -r300 -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -sOutputFile=$(tmp)%03d.png -
	touch $@
	$(MAKE) tmp=$(tmp) -f $(self) $(MAKECMDGOALS)

png := $(wildcard $(tmp)*.png)
trim := $(sort $(patsubst %.png, %.trim, $(png)))
pnm := $(patsubst %.trim, %.pnm, $(trim))

%.trim: %.png; convert -trim -border 5 -bordercolor white $< png:$@
%.pnm: %.trim; pngtopnm $< > $@

# final result
$(MAKECMDGOALS): %.png: $(pnm) $(images)
ifeq ($(MAKELEVEL), 1)
	pnmcat -tb $(filter %.pnm, $^) | pnmtopng > $@
endif

.DELETE_ON_ERROR:
.INTERMEDIATE: $(images) $(pnm) $(png)
