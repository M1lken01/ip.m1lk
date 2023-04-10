let panicKey = '.';
let helperCss = 'helper-m1lk';
let helperContentCss = 'content-m1lk';
let helper = 'after';
let inPanic = false;
let localAnswerCache = '';
let helperHtml = '<div class="hidden" id="' + helperCss + '"><input id="ip-m1lk" type="text" placeholder="192.168.0.1/24" value="192.168.0.1/24"> <a href="#" id="enter-m1lk">Enter</a> <a href="#" id="close-m1lk">Close</a><br><p id="' + helperContentCss + '" class="light-custom"></p></div>'

let helpers = {
    'title': document.getElementsByClassName('formulation')[0].querySelector('[dir="ltr"]'),
    'nav': document.querySelectorAll('section')[1].firstElementChild,
    'after': document.getElementById('responseform')
}

document.addEventListener('keydown', e => e.key == panicKey && panic());

function panic(state = undefined) {
    document.getElementById(helperCss).style.display = (inPanic || state) ? 'none' : 'unset';
    inPanic = (state == undefined) ? !inPanic : state;
}

function makeHelper(help = '') {
    if (document.getElementById(helperCss) == undefined) {
        helpers[helper].innerHTML += helperHtml;
        document.getElementById('enter-m1lk').addEventListener('click', e => search(document.getElementById('ip-m1lk').value, 'Enter'));
        document.getElementById('close-m1lk').addEventListener('click', e => panic());
        document.getElementById('ip-m1lk').addEventListener('keypress', e => search(document.getElementById('ip-m1lk').value, e.key));
    }
    document.getElementById(helperContentCss).innerHTML = help;
}

function search(addressAndMask, confirm = 'Enter') {
    if (confirm == 'Enter') {
        browser.runtime.sendMessage({
            'type': 'getIp',
            'address': addressAndMask.split('/')[0],
            'mask': addressAndMask.split('/')[1]
        }, function (res) {
            makeHelper(JSON.parse(res).html);
        });
    }
}

function init() {
    makeHelper();
}

browser.runtime.onMessage.addListener(function (req, sender, sendResponse) {
    switch (req.type) {
        case 'answerChange':
            makeHelper(req.html);
            break;
    }
});

init();