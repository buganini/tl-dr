var defaultConfig = {
    syllable: '2plus',
};

function requestProcessor(details) {
    var url = "https://xn--lhrz38b.xn--v0qr21b.xn--kpry57d";
    var headers = details.responseHeaders;
    for (var j = 0, jLen = headers.length; j !== jLen; ++j) {
        var header = headers[j];
        var name = header.name.toLowerCase();
        if (name !== "content-security-policy" &&
            name !== "content-security-policy-report-only" &&
            name !== "x-webkit-csp") {
            continue;
        }
        header.value = header.value.replace(/default-src +(?:["']none["'])?/, "default-src "+url+" ");
        header.value = header.value.replace(/media-src +(?:["']none["'])?/, "media-src "+url+" ");
    }
    return {responseHeaders: headers};
};

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    chrome.tabs.executeScript(null,{file:"tl_dr.js"});
});
chrome.webRequest.onHeadersReceived.addListener(requestProcessor, {
    urls: ["*://*/*"],
    types: ["main_frame", "sub_frame"]
}, ["blocking", "responseHeaders"]);