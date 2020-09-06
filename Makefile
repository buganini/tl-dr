# sudo npm install -g browserify

FILES =
FILES += manifest.json
FILES += icon128.png
FILES += icon16.png
FILES += icon48.png
FILES += background.js
FILES += tl_dr.bundle.js
FILES += options.html
FILES += options.js

all: tester extension

extension: extension.js tailo.gen.js
	browserify extension.js -o tl_dr.bundle.js
	rm -f tldr.zip
	zip -r tldr.zip ${FILES}

tester: tailo.gen.js
	browserify tester.js -o tester.bundle.js

tailo.gen.js: gen.js tailo.js
	node gen.js > tailo.gen.js

clean:
	rm -rf tailo.gen.js tl_dr.bundle.js tester.bundle.js tldr.zip