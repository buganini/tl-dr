FILES =
FILES += manifest.json
FILES += icon128.png
FILES += icon16.png
FILES += icon48.png
FILES += background.js
FILES += tl_dr.bundle.js
FILES += options.html
FILES += options.js

all:
	# sudo npm install -g browserify
	node gen.js > tailo.tmp.js
	browserify extension.js -o tl_dr.bundle.js
	rm -f tldr.zip
	zip -r tldr.zip ${FILES}