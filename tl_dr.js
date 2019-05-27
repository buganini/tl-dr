(function(){
    var class_name = "__tl_dr__";
    var currentHelper = null;
    var showHelper = function(){
        if(currentHelper != null){
            document.body.removeChild(currentHelper);
        }

        currentHelper = document.createElement("div");
        currentHelper.style = "text-align:center; background:#CCCCCC; padding:10px; position:fixed; z-index:1000000; left:50%; bottom:5%; transform:translateX(-50%)"
    
        var toolbar = document.createElement("div");
        toolbar.style = "text-align:right"
        currentHelper.appendChild(toolbar);

        var close = document.createElement("span");
        close.textContent = "❌";
        close.style = "cursor:pointer";
        close.onclick = function(){ document.body.removeChild(currentHelper); currentHelper = null;};
        toolbar.appendChild(close);

        var text = document.createElement("div");
        text.className = class_name;
        text.textContent = this.textContent;
        text.style="text-align:center;"
        currentHelper.appendChild(text);

        var audio = document.createElement("audio");
        audio.setAttribute("controls","");
        audio.setAttribute("autoplay","");
        audio.setAttribute("src", "https://服務.意傳.台灣/文本直接合成?查詢腔口=台語&查詢語句="+encodeURIComponent(this.textContent));
        currentHelper.appendChild(audio);

        var attribution = document.createElement("div");
        attribution.style="text-align:right; font-size:10pt"
        attribution.innerHTML = '語音合成服務由<a href="https://xn--v0qr21b.xn--kpry57d/">意傳科技</a>提供';
        currentHelper.appendChild(attribution);

        document.body.appendChild(currentHelper);
    };

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
        return "(?:"+arr.join("|")+")";
    };
    var consonants = ["b","c","d","f","g","h","j","k","kh","l","m","n","ng","p","q","r","ph","s","t","th","ts","tsh","v","w","x","y","z","ch","chh"];
    var prenuclear_glides = ["i","o","u"];
    var vowels = ["a","e","i","o","oo","u"];
    var vocalic_consonants = ["m","ng"];
    var syllable_coda = ["","i","u","m","n","nn","ng","p","t","k","h"];
    var diacritic_symbols = ["","\u0300","\u0301","\u0302","\u0304","\u030B","\u030C","\u030D"];
    var diacritic_digits = ["","1","2","3","4","5","6","7","8","9"];
    var extras = [",","\\.","\\?","!",":","\\s","-"];

    var vowels_with_diacritic_symbols = [];
    for(var s in diacritic_symbols){
        s = diacritic_symbols[s];
        var vs = [];
        for(var v in vowels){
            v = vowels[v];
            vs.push(v.substring(0,1)+s+v.substring(1));
            for(var vv in prenuclear_glides){
                vv = prenuclear_glides[vv];
                if(v[0]=="o" && vv[0]=="o"){
                    continue;
                }
                vs.push(vv+v.substring(0,1)+s+v.substring(1));
                vs.push(vv.substring(0,1)+s+vv.substring(1)+v);
            }
        }
        for(var v in vocalic_consonants){
            v = vocalic_consonants[v];
            vs.push(v.substring(0,1)+s+v.substring(1));
        }
        for(var v in vs){
            v = vs[v];
            for(var c in syllable_coda){
                c = syllable_coda[c];
                vowels_with_diacritic_symbols.push(v+c);
            }
        }
    }
    var vowels_with_diacritic_digits = [];
    var vs = vowels.concat(vocalic_consonants);
    for(var v in vs){
        v = vs[v];
        for(var c in syllable_coda){
            c = syllable_coda[c];
            vowels_with_diacritic_digits.push(v+c);
            for(var vv in prenuclear_glides){
                vv = prenuclear_glides[vv];
                if(v[0]=="o" && vv[0]=="o"){
                    continue;
                }
                vowels_with_diacritic_digits.push(vv+v+c);
            }
        }
    }
    var vowels_with_diacritics = group([group(vowels_with_diacritic_symbols),group(vowels_with_diacritic_digits)+group(diacritic_digits)]);
    consonants = group(consonants);
    vowels = group(vowels);
    syllable_coda = group(syllable_coda);
    extras = group(extras);
    var syllable = (consonants)+"?"+(vowels_with_diacritics);

    var regex = "(?<=^|[^a-z0-9\u0300-\u036F])(?:"+(syllable)+(extras)+"+)+(?:"+(syllable)+")(?=[^a-z0-9\u0300\u0301\u0302\u0304\u030B\u030C\u030D]|\\b|$)";
    // console.log(regex);
    // console.log(regex.length);
    var re = new RegExp(regex, "gi");
    var tldr = function(){
        var iter = document.evaluate("//body//text()[string-length(normalize-space(.))>2]", document, null, XPathResult.ANY_TYPE, null);
        var texts = [];
        var t;
        while(t=iter.iterateNext()){
            if(["SCRIPT","STYLE","TEXTAREA"].indexOf(t.parentNode.nodeName)!=-1){
                continue;
            }
            if(t.parentNode.className==class_name){
                continue;
            }
            texts.push(t);
        }
        for(var text in texts){
            text = texts[text];
            var t = text.textContent.normalize('NFD');
            var matches = t.match(re);
            if(matches){
                var tokens = [];
                for(var m in matches){
                    m = matches[m];
                    var i = t.indexOf(m);
                    tokens.push(t.substring(0,i));
                    tokens.push(m);
                    t = t.substring(i+m.length);
                }
                tokens.push(t);
                for(var i in tokens){
                    var tk = tokens[i];
                    var n;
                    if(i&1){
                        var n = document.createElement("span");
                        n.className=class_name;
                        n.style = "cursor:pointer";
                        n.onclick = showHelper;
                        n.textContent = tk;
                        // console.log("TL:"+tk);
                    }else{
                        n = document.createTextNode(tk);
                    }
                    text.parentNode.insertBefore(n, text);
                }
                text.parentNode.removeChild(text);
            }
        }
    };
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var observer = new MutationObserver(function(mutations, observer) {
        tldr();
    });
    observer.observe(document, {
        subtree: true,
        childList: true
    });
    tldr();
})();