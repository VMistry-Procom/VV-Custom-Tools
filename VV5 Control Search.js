// ==UserScript==
// @name         VV5 Control Search
// @namespace    https://github.com/jsevilla-procom
// @version      1.0
// @description  Waits for elements to load then creates a search bar for groups and conditions filtering
// @author       Vishul Mistry
// @match        https://*.visualvault.com/FormDesigner/*
// @grant        none
// ==/UserScript==

var InitSearchBar = function(controlsListElem) {
    // create and place search bar into the HTML
    var searchBar = $('<input id="mySearch" style="display:block" type="text">');
    searchBar.insertBefore(controlsListElem.parent().parent());

    // on each keypress, search through groups for textbox input
    searchBar.keyup(function(){
        var searchBarInput = searchBar.val().toLowerCase();

        // get the immediate child <li> (group element)
        controlsListElem.children('div').children('div').each(function(index, elem) {
            var controlElement = $(elem).children('div').children('span')[0];
            // if searchbar text is blank OR is included in group name/items
            if (searchBarInput === '' || (controlElement.outerText).toLowerCase().includes(searchBarInput)) {
                $(controlElement).parent().parent().show();
            } else {
                $(controlElement).parent().parent().hide();
            }
        });
    });
};

var FindControlListHolder = function() {
    // mainContainer holds the most pertinent content of the designer
    var mainContainerMatches = $('.mainContainer-heightControl');
    if (mainContainerMatches.length < 1) {
        throw new Error('VV5 Groups and Conditions Search - Could not find main container element; HTML structure on document ready has possibly changed. Terminating userscript.');
    }
    var mainContainer = mainContainerMatches[0];

    // create an observer instance with callback for changes
    var controlListElem = null;
    var controlFullyPopulated = false;
    var onMutation = function(mutations, me) {
        // 'mutations' is an array of mutations that occurred
        // 'me' is the MutationObserver instance

        var tempElem;
        if (controlListElem === null) {
            // first find the controlList element, it will not have list items yet
            tempElem = $('.fd-formfieldlist-holder');
            if (tempElem.length > 0) {
                controlListElem = tempElem;
            }
        } else if (controlFullyPopulated === false) {
            // next find the last list item (with class 'k-last') using the grouplist elem as a key
            tempElem = controlListElem.find('.fd-formfieldlist-item').last();
            if (tempElem.length > 0) {
                controlFullyPopulated = true;
                InitSearchBar(controlListElem); // last item loaded, initialize search bar
                observer.disconnect();
            }
        } else {
            observer.disconnect();
        }
    };
    var observer = new MutationObserver(onMutation);

    // configuration of the observer
    var config = {
        childList: true,
        subtree: true,
        characterData: false,
    };

    // observe for changes
    observer.observe(mainContainer, config);
};

// runs function on document ready
$(document).ready(FindControlListHolder);

