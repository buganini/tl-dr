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
        var tl = require('./tailo.gen.js');
        var syllable = tl.syllable;
        var prefix = tl.prefix;
        var suffix = tl.suffix;
        var delimiters = tl.delimiters;
        switch(items.syllable){
            case "1plus":
                regex = `${prefix}${delimiters}*(${syllable}(?:${delimiters}+${syllable})*${delimiters}*)${suffix}`;
                break;
            case "2plus":
                regex = `${prefix}${delimiters}*((?:${syllable}${delimiters}+)+${syllable}${delimiters}*)${suffix}`;
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