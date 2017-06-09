'use strict';
/*global $:false */

angular.module('core').factory('TypewriterFactory', [
    function() {
        var typewriterFactory = {};
        typewriterFactory.getPendingText = function(pendingReplaced, phraseObject) {
            
            var stringArray = [];
            var iconStartIndexs = [];
            var iconEndIndexs = [];
            var iconsArray = [];
            var count = 0;
            var newString = '';

            if(pendingReplaced === '') {
                stringArray = phraseObject.text.split(' ');
                angular.forEach(phraseObject.wordsAndIcons, function(wordsAndIcons, key){
                    var glyphPath = 'glyphicon glyphicon-' + wordsAndIcons.icon;
                    var icon = '<i class="' + glyphPath + '"/>';
                    var words = wordsAndIcons.words;

                    angular.forEach(words, function(word, key){
                        stringArray[word] = icon;
                    });
                });
            } else {
                var pendingString = pendingReplaced;
                for (var i1 = pendingString.indexOf('<'); i1 >= 0; i1 = pendingString.indexOf('<', i1 + 1)) {
                    iconStartIndexs.push(i1);
                } 
                for (var i2 = pendingString.indexOf('/>'); i2 >= 0; i2 = pendingString.indexOf('/>', i2 + 1)) {
                    iconEndIndexs.push(i2 - 1);
                }
                for (var i3 = 0; i3 < iconStartIndexs.length; i3++) {
                    var start = iconStartIndexs[i3] + 20,
                    end = iconEndIndexs[i3];
                    var glyph = pendingString.substring(start, end);

                    iconsArray.push(pendingString.substring(iconStartIndexs[i3], end + 3));
                    var encodedIcon = '<icon>' + glyph + '</icon>';

                    if(!newString) {
                        newString = pendingString.replace(iconsArray[i3], encodedIcon);
                    } else {
                        newString = newString.replace(iconsArray[i3], encodedIcon);
                    }
                }
                stringArray = newString.split(' ');

                angular.forEach(phraseObject.wordsAndIcons, function(wordsAndIcons, key){
                    var glyphPath = 'glyphicon glyphicon-' + wordsAndIcons.icon;
                    var icon = '<i class="' + glyphPath + '"/>';
                    var words = wordsAndIcons.words;

                    angular.forEach(words, function(word, key){
                        stringArray[word] = icon;
                    });

                    for(var i4 = 0; i4 < stringArray.length; i4++) {
                        if(stringArray[i4].indexOf('<icon>') > -1){
                            stringArray[i4] = iconsArray[count];
                            count++;
                        }
                    }
                });
            }
            return stringArray.join(' ');
        };

        typewriterFactory.getTypewriterObject = function(phraseObject, selectedWords, glyphName) {

            var count = 0;

            angular.forEach(selectedWords, function(word){
                angular.forEach(phraseObject.wordsAndIcons, function(set, key){
                    // If a selected word is already being used as an icon
                    if(set.words.indexOf(word) >= 0) {
                        if(set.icon !== glyphName) {
                            set.words.splice(set.words.indexOf(word), 1);
                            if(set.words.length === 0) {
                                phraseObject.wordsAndIcons.splice(key, 1);
                            }
                            if(!typewriterFactory.hasOwnValue(phraseObject.wordsAndIcons, glyphName)) {
                                phraseObject.wordsAndIcons.push({
                                    words: selectedWords, 
                                    icon: glyphName
                                });
                            }
                            
                        }
                    } else if(count === 0) {
                        if(set.icon !== glyphName) {
                            phraseObject.wordsAndIcons.push({
                                words: selectedWords, 
                                icon: glyphName
                            });
                        } else {
                            set.words.push(word);
                        }
                        count++;
                    }
                });
            });
            
            return phraseObject;
        };

        typewriterFactory.hasOwnValue = function(obj, val) {
            for(var prop in obj) {
                if(obj.hasOwnProperty(prop)) {
                    if(obj[prop].icon === val) {
                        return true;
                    }
                }
            }
        };

        return typewriterFactory;
    }

]);
