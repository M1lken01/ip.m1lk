const storageItems = ['searchAddress', 'searchMask', 'answer', 'subnetSplit'];
const storageItemDefaults = ['192.168.0.1', '24', '', true];
const splitChar = '.';

browser.runtime.onMessage.addListener(function (req, sender, sendResponse) {
    switch (req.type) {
        case 'getIp':
            const ans = calcIp(req.address, Number(req.mask));
            localStorage.setItem('answer', JSON.stringify(ans));
            localStorage.setItem('searchAddress', req.address);
            localStorage.setItem('searchMask', req.mask);
            sendResponse(JSON.stringify(ans));
            break;
    }
});

function msg(req) {
    return browser.runtime.sendMessage(req);
}

function reset(force = false) {
    for (let i = 0; i < storageItems.length; i++) {
        if (localStorage.getItem(storageItems[i]) == null || force)
            localStorage.setItem(storageItems[i], storageItemDefaults[i]);
    }
}

function answerParser(answer) {
    const table = document.createElement('table');
    table.id = 'table-m1lk';
    for (const key in answer) {
        if (answer.hasOwnProperty(key) && !key.includes('_bin')) {
            const tr = document.createElement('tr');
            tr.appendChild(document.createElement('td')).textContent = key;
            const td = tr.appendChild(document.createElement('td'));
            td.textContent = answer[key];
            if (key + '_bin' in answer)
                tr.appendChild(document.createElement('td')).textContent = answer[key + '_bin'];
            else
                td.setAttribute('colspan', 2);
            table.appendChild(tr);
        }
    }
    return table.outerHTML.toString();
}

function calcIp(address, maskBits) {
    const ip = address.split(splitChar).map(Number);
    const subnetMask = getSubnetMask(maskBits);
    const network = ip.map((octet, i) => octet & subnetMask[i])
    const broadcast = ip.map((octet, i) => octet | subnetMask.map(mask => 255 - mask)[i]);
    const hostRange = getHostRange(network, broadcast);
    let ans = {
        address,
        netmask: subnetMask.join(splitChar),
        network: network.join(splitChar),
        host_min: hostRange[0].join(splitChar),
        host_max: hostRange[1].join(splitChar),
        broadcast: broadcast.join(splitChar), // szorasi cim
        wildcard: subnetMask.map(mask => 255 - mask).join(splitChar),
        short: address + ' /' + maskBits,
        private: checkPrivate(ip),
        total_hosts: Math.pow(2, 32 - maskBits),
        usable_hosts: Math.pow(2, 32 - maskBits) - 2,
    };
    for (const key in ans) {
        if (Object.hasOwnProperty.call(ans, key)) {
            if (typeof ans[key] === 'string' && !ans[key].includes(' ')) {
                let bin = ans[key].split(splitChar).map(octet => parseInt(octet).toString(2).padStart(8, '0')).join(splitChar);
                if (localStorage.getItem('subnetSplit') == 'true')
                    bin = bin.slice(0, maskBits + 2) + ' ' + bin.slice(maskBits + 2);
                ans[key + '_bin'] = bin;
            }
        }
    }
    ans.html = answerParser(ans);
    return ans;
}

function getSubnetMask(mask) {
    const subnetMask = [0, 0, 0, 0];
    for (let i = 0; i < parseInt(mask); i++) {
        subnetMask[Math.floor(i / 8)] += 1 << (7 - (i % 8));
    }
    return subnetMask;
}

function getHostRange(network, broadcast) {
    const hostMin = network.map(Number);
    const hostMax = broadcast.map(Number);
    hostMin[3]++;
    hostMax[3]--;
    return [hostMin, hostMax];
}

function checkPrivate(ip) {
    const [a, b, c, d] = ip;
    if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) {
        return true;
    }
    return false;
}

function init() {
    console.log(calcIp('192.168.0.1', 13)); //debug
    reset();
}

init();