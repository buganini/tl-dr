var group = function(arr){
    arr = Array.from(new Set(arr));
    arr.sort(function(a,b){
        var c = b.length - a.length;
        if (c != 0){
            return c;
        }
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    });
    var tks = [];
    var bytes = [];
    for(var i in arr){
        var tk = arr[i];
        if(tk.length==1){
            if("^\\-".indexOf(tk) != -1){
                tk = "\\"+tk;
            }
            bytes.push(tk);
        }else{
            tks.push(tk);
        }
    }
    if(tks.length==0){
        return "["+bytes.join("")+"]";
    }else{
        if(bytes.length>0){
            tks.push("["+bytes.join("")+"]");
        }
        return "(?:"+tks.join("|")+")";
    }
};

// https://zh.wikipedia.org/wiki/%E8%BE%85%E9%9F%B3
var consonants = ["b","c","d","f","g","h","j","k","kh","l","m","n","ng","p","q","r","ph","s","t","th","ts","tsh","v","w","x","y","z","ch","chh"];

// https://zh.wikipedia.org/wiki/%E4%BB%8B%E9%9F%B3
var prenuclear_glides = ["i","o","u","\u0131"];

// https://zh.wikipedia.org/wiki/%E5%85%83%E9%9F%B3
var vowels = ["a","e","i","o","oo","u","ai","\u0131"];
var extra_vowels = ["ee","eng","eeh","ek","[i\u0131]onn","[i\u0131]onnh","er","ere^","eru^","erh","ereh","[i\u0131]r","[i\u0131]rinn","[i\u0131]rh","[i\u0131]rm","[i\u0131]rn","[i\u0131]rng","[i\u0131]rp","[i\u0131]rt","[i\u0131]rk"];

// https://zh.wikipedia.org/wiki/%E9%9F%B3%E7%AF%80%E8%BC%94%E9%9F%B3
var vocalic_consonants = ["m","ng"];

// https://zh.wikipedia.org/wiki/%E9%9F%B5%E5%B0%BE
var syllable_coda = ["i","u","m","n","nn","ⁿ","ng","p","t","k","h"];

// diacritic
var diacritic_symbols = "[\u0300\u0301\u0302\u0304\u030B\u030C\u030D\u0358]{1,2}";
var diacritic_digits = "[1-9]";

// delimiters
var delimiters = "[,.?!: /\\\\()\"-]";

var vowels_with_diacritics = [];
var vowels_without_diacritics = [];
var vs = [];
for(var v in vowels){
    v = vowels[v];
    vs.push(v.substring(0,1)+"^"+v.substring(1));
    for(var vv in prenuclear_glides){
        vv = prenuclear_glides[vv];
        if(v[0]==vv[0]){
            continue;
        }
        vs.push(vv+v.substring(0,1)+"^"+v.substring(1));
        vs.push(vv.substring(0,1)+"^"+vv.substring(1)+v);
    }
}
for(var v in vocalic_consonants){
    v = vocalic_consonants[v];
    vs.push(v.substring(0,1)+"^"+v.substring(1));
}
for(var v in vs){
    v = vs[v];
    vowels_with_diacritics.push(v.replace("^", diacritic_symbols));
    vowels_without_diacritics.push(v.replace("^", ""));
}
for(var v in extra_vowels){
    v = extra_vowels[v];
    if(v.indexOf("^")!=-1){
        vowels_with_diacritics.push(v.replace("^", diacritic_symbols));
        vowels_without_diacritics.push(v.replace("^",""));
    }else{
        vowels_with_diacritics.push(v.substring(0,1)+diacritic_symbols+v.substring(1));
        vowels_without_diacritics.push(v);
    }
}

syllable_coda = group(syllable_coda);
var vowels_with_diacritics = group([group(vowels_with_diacritics)+syllable_coda+"?",group(vowels_without_diacritics)+syllable_coda+"?"+diacritic_digits+"?"]);
consonants = group(consonants);
vowels = group(vowels);
syllable_coda = group(syllable_coda);

// https://zh.wikipedia.org/wiki/%E9%9F%B3%E8%8A%82
var syllable = (consonants)+"?"+(vowels_with_diacritics);

var prefix = "(?:^|[^a-z0-9\u0300-\u036F\u0358\u0131-])";
var suffix = "(?=[^a-z0-9\u0300-\u036F\u0358\u0131-]|$)";

module.exports = {
    syllable: syllable,
    prefix: prefix,
    suffix: suffix,
    delimiters: delimiters,
};