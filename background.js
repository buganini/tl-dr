function requestProcessor(details) {
    var headers = details.responseHeaders;
    for (var j = 0, jLen = headers.length; j !== jLen; ++j) {
        var header = headers[j];
        var name = header.name.toLowerCase();
        if (name !== "content-security-policy" &&
            name !== "content-security-policy-report-only" &&
            name !== "x-webkit-csp") {
            continue;
        }
        console.log(header.value);
        header.value = header.value.replace("media-src ", "media-src https://xn--lhrz38b.xn--v0qr21b.xn--kpry57d ");
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