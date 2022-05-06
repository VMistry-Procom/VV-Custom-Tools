// ==UserScript==
// @name         VV5 Control Search
// @namespace    https://github.com/jsevilla-procom
// @version      1.0
// @description  Waits for elements to load then creates a search bar for Controls filtering
// @author       Vishul Mistry
// @match        https://*.visualvault.com/FormDesigner/*
// @grant        none
// ==/UserScript==

var InitSearchBar = function(controlsListItemElem) {
    // create and place search bar into the HTML
    var searchBar = $('<input id="mySearch" style="display:block" type="text">');
    searchBar.insertBefore(controlsListItemElem.parent().parent());

    // on each keypress, search through control names for textbox input
    searchBar.keyup(function(){
        var searchBarInput = searchBar.val().toLowerCase();

        // get the immediate child '.formfieldlist > .fd-formfieldlist-item' (control element)
        controlsListItemElem.children('div').children('div').each(function(index, elem) {
            // get the current element's text html ('.fd-formfieldlist-item-text > .fd-formfieldlist-text')
            var controlElement = $(elem).children('div').children('span')[0];
            // check if searchbar text is blank OR is included in control name
            if (searchBarInput === '' || (controlElement.outerText).toLowerCase().includes(searchBarInput)) {
                //Search input is blank or control name contains search input text. 
                $(controlElement).parent().parent().show();
            } else {
                //Search input is not blank and control name does not contain search input text.
                $(controlElement).parent().parent().hide();
            }
        });
    });
};

var FindControlListHolder = function() {
    // mainContainer holds the most pertinent content of the designer
    var mainContainerMatches = $('.mainContainer-heightControl');
    if (mainContainerMatches.length < 1) {
        throw new Error('VV5 Controls Search - Could not find main container element; HTML structure on document ready has possibly changed. Terminating userscript.');
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
            // next find the last control element item (with class '.fd-formfieldlist-item') using the controlList elem as a key
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
