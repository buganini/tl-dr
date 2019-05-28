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
        text.style="text-align:center; color:#000;"
        currentHelper.appendChild(text);

        var audio = document.createElement("audio");
        audio.setAttribute("controls","");
        audio.setAttribute("autoplay","");
        audio.setAttribute("src", "https://服務.意傳.台灣/文本直接合成?查詢腔口=台語&查詢語句="+encodeURIComponent(this.textContent));
        currentHelper.appendChild(audio);

        var attribution = document.createElement("div");
        attribution.style="text-align:right; font-size:10pt; color:#777;"
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
    var consonants = ["b","c","d","f","g","h","j","k","kh","l","m","n","ng","p","q","r","ph","s","t","th","ts","tsh","v","w","x","y","z","ch","chh"];
    var prenuclear_glides = ["i","o","u","\u0131"];
    var vowels = ["a","e","i","o","oo","u","ai","\u0131"];
    var vocalic_consonants = ["m","ng"];
    var syllable_coda = ["i","u","m","n","nn","ng","p","t","k","h"];
    var extra_vowels = ["ee","eng","eeh","ek","[i\u0131]onn","[i\u0131]onnh","er","ere^","eru^","erh","ereh","[i\u0131]r","[i\u0131]rinn","[i\u0131]rh","[i\u0131]rm","[i\u0131]rn","[i\u0131]rng","[i\u0131]rp","[i\u0131]rt","[i\u0131]rk"];
    var diacritic_symbols = "[\u0300\u0301\u0302\u0304\u030B\u030C\u030D]";
    var diacritic_digits = "[1-9]";
    var extras = "[,.?!: /\\\\-]";

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
    var syllable = (consonants)+"?"+(vowels_with_diacritics);

    var prefix = "(?:^|[^a-z0-9\u0300-\u036F\u0131-])";
    var suffix = "(?=[^a-z0-9\u0300-\u036F\u0131-]|$)";

    var pattern;

    var last_run = 0;
    var timeout;
    var debounce_threshold = 10000;
    var tldr = function(){
        var now = new Date().getTime();
        if(now - last_run > debounce_threshold){
            if(timeout){
                clearTimeout(timeout);
            }
            last_run = now;
            _tldr();
        }
        if(timeout){
            clearTimeout(timeout);
        }
        timeout = setTimeout(_tldr, debounce_threshold);
    };

    var _tldr = function(){
        var iter = document.evaluate("//body//text()[string-length(normalize-space(.))>2]", document, null, XPathResult.ANY_TYPE, null);
        var texts = [];
        var t;
        while(t=iter.iterateNext()){
            if(["SCRIPT","STYLE","TEXTAREA","NOSCRIPT"].indexOf(t.parentNode.nodeName)!=-1){
                continue;
            }
            var skip = false;
            var p = t.parentNode;
            while(p){
                if(p.getAttribute){
                    skip = skip || p.getAttribute("contenteditable")=="true";
                    if(skip){
                        break;
                    }
                }
                p = p.parentNode;
            }
            if(skip){
                continue;
            }

            var p = t.parentNode;
            while(p){
                if(p.getAttribute){
                    skip = skip || p.className==class_name;
                }
                if(skip){
                    break;
                }
                p = p.parentNode;
            }
            if(skip){
                continue;
            }
            texts.push(t);
        }
        iter = null;
        for(var text in texts){
            text = texts[text];
            var t = text.textContent.normalize('NFD');
            var match = t.match(pattern);
            var tokens = [];
            while(match){
                var m = match[1];
                var i = t.indexOf(m);
                tokens.push(t.substring(0,i));
                tokens.push(m);
                t = t.substring(i+m.length);

                match = t.match(pattern);
            }
            tokens.push(t);
            if(tokens.length > 0){
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
    chrome.storage.local.get({
        syllable: '2plus',
    }, function(items) {
        var regex;
        switch(items.syllable){
            case "1plus":
                regex = `${prefix}${extras}*(${syllable}(?:${extras}+${syllable})*)${extras}*${suffix}`;
                break;
            case "2plus":
                regex = `${prefix}${extras}*((?:${syllable}${extras}+)+${syllable})${extras}*${suffix}`;
                break;
        }
        // console.log(regex.replace(/[\u007F-\uFFFF]/g, function(chr) {
        //     return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
        // }));
        // console.log(regex.length);
        pattern = new RegExp(regex, "i");
        MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        var observer = new MutationObserver(function(mutations, observer) {
            tldr();
        });
        observer.observe(document, {
            subtree: true,
            childList: true
        });
        tldr();
    });
})();