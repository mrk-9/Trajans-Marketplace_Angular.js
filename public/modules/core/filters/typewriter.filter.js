'use strict';

angular.module('core').filter('typewriter', function() {
  return function(pendingReplaced, phraseHolder, index) {
    var stringArray = [];
    var iconStartIndexs = [];
    var iconEndIndexs = [];
    var iconsArray = [];
    var count = 0;
    var newString = '';

    stringArray = phraseHolder[index].text.split(' ');

    angular.forEach(phraseHolder[index].wordsAndIcons, function(wordsAndIcons, key){
        var glyphPath = 'glyphicon glyphicon-' + wordsAndIcons.icon;
        var icon = '<i class="' + glyphPath + '"/>';
        var words = wordsAndIcons.words;

        angular.forEach(words, function(word, key){
            stringArray[word] = icon;
        });
    });
    
    return stringArray.join(' ');
  };
});