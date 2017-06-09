'use strict';

/*global $:false */


function blobToFile(theBlob, fileName){
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
}

// Listings controller
angular.module('listings').factory('ImageFactory', [
    function() {

      var imageFactory = {};

      imageFactory.getImages = function (listingImages){
  		  var images = [];
  			for (var i = 0; i < listingImages.length; i++) {
  				if (listingImages[i]) {
  					images.push(listingImages[i]);
  				}
  			}
  			return images;
  		};
  		
  		imageFactory.makePrimary = function (fileName, listingImages){
  			for (var i = listingImages.length - 1; i >= 0; i--) {
                  if (listingImages[i] === fileName) {
                      listingImages.splice(i, 1);
                  }
              }
              listingImages.unshift(fileName);
  			return listingImages;
  		};
  		
  		imageFactory.removeImage = function (fileName, listingImages){
  			var i = listingImages.indexOf(fileName);
              if (i !== -1) {
                  listingImages.splice(i, 1);
              }
              $('#' + fileName).remove();
  			return listingImages;
  		};
  		
  		imageFactory.removeFile = function (fileName, listingFiles){
  			for (var i = listingFiles.length - 1; i >= 0; i--) {
                  if (listingFiles[i] === fileName) {
                      listingFiles.splice(i, 1);
                  }
              }
  			return listingFiles;
  		};

      imageFactory.b64toFile = function(b64Data, contentType, imageId) {

        contentType = contentType || '';
        var sliceSize = 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          var slice = byteCharacters.slice(offset, offset + sliceSize);

          var byteNumbers = new Array(slice.length);
          for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }

          var byteArray = new Uint8Array(byteNumbers);

          byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});

        var file = blobToFile(blob, imageId);

        return file;

      };

      return imageFactory;
    
    }
]);
