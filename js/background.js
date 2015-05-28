require(['./common'], function(common) {
    require(['c4/APIconnector'], function(APIconnector) {
        var msgAllTabs = function(msg) {
            chrome.tabs.query({}, function(tabs) {
                for (var i = 0, len = tabs.length; i < len; i++) {
                    chrome.tabs.sendMessage(tabs[i].id, msg);
                }
            });
        };


        chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
            if (typeof msg.method !== 'undefined') {
                switch (msg.method) {
                    case 'triggerQuery':
                        console.log(msg.data);
                        APIconnector.query(msg.data, function(response) {
                            if (response.status === 'success') {
                                msgAllTabs({
                                    method: 'newResults',
                                    data: {profile: msg.data, results: {results: response.data.result}}
                                });
                            } else {
                                msgAllTabs({method: 'error', data: response.data});
                            }
                            console.log(response.status);
                            console.log(response.data);
                        });
                        break;
                    default:
                        console.log('unknown method: ' + msg.method);
                        break;
                }
            } else {
                console.log('method not specified');
            }
        });
    });
});
