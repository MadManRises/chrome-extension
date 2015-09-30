require(['searchBar', 'c4/paragraphDetection', 'c4/namedEntityRecognition', 'c4/iframes'], function(searchBar, paragraphDetection, ner, iframes) {
    searchBar.init(function(profile) {
        chrome.runtime.sendMessage({method: 'triggerQuery', data: profile});
        iframes.sendMsgAll({event: 'eexcess.queryTriggered'});
        searchBar.show();
    });
    window.onmessage = function(msg) {
        if (msg.data.event && msg.data.event === 'eexcess.queryTriggered') {
            chrome.runtime.sendMessage({method: 'triggerQuery', data: msg.data.data});
            iframes.sendMsgAll({event: 'eexcess.queryTriggered', data: msg.data.data});
        }
        // console.log(e.data);
        // do something
    };

    // detect paragraphs
    var p = paragraphDetection.getParagraphs();


//    EexcessSite.init();
//    EexcessSite.setParagraphs(p);

    // enrich paragraphs with entities
    ner.entitiesAndCategories(p.map(function(par) {
        return {
            id: par.id,
            headline: par.headline,
            content: par.content
        };
    }), function(result) {
        console.log(result);
        if (result.status && result.status === 'success') {
            paragraphDetection.enrichParagraphs(p, result.data.paragraphs);
        }
    });

    // selection listener
//    $(document).mouseup(function() {
//        var selection = paragraphDetection.getSelection(p);
//        if (selection.selection.length > 0) {
//            var profile = {
//                // TODO: split terms
//                contextKeywords: [{
//                        text: selection.selection,
//                        weight: 1.0
//                    }]
//            };
//            if (selection.entities) {
//                profile.contextNamedEntities = selection.entities;
//            }
//            // TODO: provide reason
//            chrome.runtime.sendMessage({method: 'triggerQuery', data: profile});
//            iframes.sendMsgAll({event: 'eexcess.queryTriggered'});
//            searchBar.show();
//        }
//        console.log(selection);
//    });

    // augment links
//    $(function() {
//        paragraphDetection.augmentLinks(
//                $('.' + paragraphDetection.getSettings().classname),
//                chrome.extension.getURL('media/icons/19.png'),
//                function(profile) {
//                    // TODO: provide reason
//                    chrome.runtime.sendMessage({method: 'triggerQuery', data: profile});
//                    iframes.sendMsgAll({event: 'eexcess.queryTriggered'});
//                    searchBar.show();
//                },
//                paragraphDetection.getSettings().classname, p
//                );
//    });

    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
        console.log(msg);
        if (msg.method) {
            switch (msg.method) {
                case 'newResults':
                    iframes.sendMsgAll({event: 'eexcess.newResults', data: msg.data});
                    break;
                case 'error':
                    iframes.sendMsgAll({event: 'eexcess.error', data: msg.data});
                    break;
                default:
                    console.log('unknown method');
                    break;
            }
        } else {
            console.log('method not specified');
        }
    });

    var lastY = 0;

    $(document).mousemove(function(e) {
        lastY = e.pageY;
    });

    $(document).on('paragraphFocused', function(evt) {
        if (lastY < $(window).scrollTop() + $(window).height() - 90) {
            p.forEach(function(v1) {
                $(v1.elements[0]).parent().css('border', '1px solid silver');
            });
            $(evt.originalEvent.detail.elements[0]).parent().css('border', '2px solid green');
            if (evt.originalEvent.detail.topic) {
                // TODO: adapt
                searchBar.setMainTopic({
                    uri: evt.originalEvent.detail.topic.entityUri,
                    text: evt.originalEvent.detail.mainTopic.text,
                    isMainTopic: true
                });
            }
            if (evt.originalEvent.detail.entities) {
                searchBar.setLabels(evt.originalEvent.detail.entities);
            }
        }
    });


    paragraphDetection.findFocusedParagraph();
});