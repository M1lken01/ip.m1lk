function swap(x, y) {
    return (-x + y);
}

function msg(req) {
    return browser.runtime.sendMessage(req);
}

function getIp() {
    browser.runtime.sendMessage({
        'type': 'getIp',
        'address': document.getElementById('address').value,
        'mask': document.getElementById('mask').value
    }, function (res) {
        document.getElementById('answer').innerHTML = JSON.parse(res).html;
    });
}

function init() {
    document.getElementById('answer').innerHTML = JSON.parse(localStorage.getItem('answer')).html;
    document.getElementById('address').value = localStorage.getItem('searchAddress');
    document.getElementById('mask').value = localStorage.getItem('searchMask');
    document.getElementById('calc').addEventListener('click', e => getIp());
}

browser.runtime.onMessage.addListener(function (req, sender, sendResponse) {
    switch (req.type) {
        case 'showPage':
            // no
            break;
    }
});

init();