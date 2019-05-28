function save_options() {
    var syllable = document.getElementById('syllable').value;
    chrome.storage.sync.set({
        syllable: syllable,
    }, function() {
        var status = document.getElementById('status');
        status.textContent = '已儲存';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    chrome.runtime.sendMessage({
        action: "GET_CONFIG"
    }, function(items) {
        document.getElementById('syllable').value = items.syllable;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);