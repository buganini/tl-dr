var tl = require('./tailo.js');

process.stdout.write("var syllable=");
process.stdout.write(JSON.stringify(tl.syllable));
process.stdout.write(";\n");

process.stdout.write("var prefix=");
process.stdout.write(JSON.stringify(tl.prefix));
process.stdout.write(";\n");

process.stdout.write("var suffix=");
process.stdout.write(JSON.stringify(tl.suffix));
process.stdout.write(";\n");

process.stdout.write("var delimiters=");
process.stdout.write(JSON.stringify(tl.delimiters));
process.stdout.write(";\n");

process.stdout.write("module.exports = {\n\
    syllable: syllable,\n\
    prefix: prefix,\n\
    suffix: suffix,\n\
    delimiters: delimiters,\n\
};");