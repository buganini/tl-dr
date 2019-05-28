FILES =
FILES += manifest.json
FILES += icon128.png
FILES += icon16.png
FILES += icon48.png
FILES += background.js
FILES += tl_dr.js
FILES += options.html
FILES += options.js

all:
	rm -f tldr.zip
	zip -r tldr.zip ${FILES}