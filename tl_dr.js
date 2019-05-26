(function(){
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

    var alphabets = "abeghijklmnopstu";
    var diacritics = "\u0300\u0301\u0302\u0304\u030B\u030C\u030D";
    var extras = ",.?!: -";
    var re = new RegExp('['+alphabets+']+['+alphabets+extras+']*['+diacritics+']+(?:['+alphabets+extras+']*['+diacritics+']*)*', "gi");
    var tldr = function(){
        var iter = document.evaluate("//body//text()[string-length(normalize-space(.))>2]", document, null, XPathResult.ANY_TYPE, null);
        var texts = [];
        var t;
        while(t=iter.iterateNext()){
            if(["SCRIPT","STYLE"].indexOf(t.parentNode.nodeName)!=-1){
                continue;
            }
            if(t.parentNode.className=="__tl_dr__"){
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
                        n.className="__tl_dr__";
                        n.style = "cursor:pointer";
                        n.onclick = showHelper;
                        n.textContent = tk;
                    }else{
                        n = document.createTextNode(tk);
                    }
                    text.parentNode.insertBefore(n, text);
                }
                text.parentNode.removeChild(text);
                // console.log(text);
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