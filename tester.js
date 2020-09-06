$(function(){
    var tokenizer = function(regex, text, group){
        var pattern = new RegExp(regex, "i");
        var t = text.normalize('NFD');
        var match = t.match(pattern);
        var tokens = [];
        while(match){
            var m = match[group];
            var i = t.indexOf(m);
            tokens.push(t.substring(0,i));
            tokens.push(m);
            t = t.substring(i+m.length);

            match = t.match(pattern);
        }
        tokens.push(t);
        return tokens;
    };

    var tl = require('./tailo.gen.js');
    var syllable = tl.syllable;
    var prefix = tl.prefix;
    var suffix = tl.suffix;
    var delimiters = tl.delimiters;
    var regex_1plus_delim = `${prefix}${delimiters}*(${syllable}(?:${delimiters}+${syllable})*${delimiters}*)${suffix}`;
    var regex_2plus_delim = `${prefix}${delimiters}*((?:${syllable}${delimiters}+)+${syllable}${delimiters}*)${suffix}`;
    var regex_1plus = `${prefix}${delimiters}*(${syllable}(?:${delimiters}*${syllable})*${delimiters}*)${suffix}`;
    var regex_2plus = `${prefix}${delimiters}*((?:${syllable}${delimiters}*)+${syllable}${delimiters}*)${suffix}`;

    var $text = $("#text");
    var $result = $("#result");
    $("#parse").click(function(){
        $result.empty();
        if($("#omit_delimiter").is(":checked")){
            if($("input[name='syllable']:checked").val()=="1"){
                regex = regex_1plus;
            }else{
                regex = regex_2plus;
            }
        }else{
            if($("input[name='syllable']:checked").val()=="1"){
                regex = regex_1plus_delim;
            }else{
                regex = regex_2plus_delim;
            }
        }
        var tokens = tokenizer(regex, $text.val(), 1);
        for(var i in tokens){
            var tk = tokens[i];
            if(i&1){
                var $tk = $("<div>").addClass("sequence");
                var words = tokenizer(syllable, tk, 0);
                for(var j in words){
                    if(j&1){
                        var wd = words[j];
                        var $wd = $("<span>").addClass("syllable").text(wd);
                        $tk.append($wd);
                    }
                }
                $result.append($tk);
            }
        }
    });
});
