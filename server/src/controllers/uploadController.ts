import * as mongoose from 'mongoose';
import * as _ from 'lodash';
import * as fs from 'fs-extra';

import constants from '../constants/constants';
import helper from './_controllerHelper';
import uploadRepository from '../repositories/uploadRepository';

var temp = require('temp');
var path = require('path');
var appDir = path.dirname(require.main.filename);
var promise = require('bluebird');
var fsextra = promise.promisifyAll(require('fs-extra'));
var User = mongoose.model('User');
var Upload = mongoose.model('Upload');
var ListingImage = mongoose.model('ListingImage');
var Listing = mongoose.model('Listing');
var SiteDefault = mongoose.model('SiteDefault');
var Q = require('q');
var guid = require('node-uuid');
var AWS = require('aws-sdk');
var uuid = require('node-uuid');
var cors = require('cors');
var _atob = require('atob');

AWS.config.update({
    accessKeyId: constants.awsUsername,
    secretAccessKey: constants.awsPassword,
    region: '',
    maxAsyncS3: 20,
    s3RetryCount: 3,
    s3RetryDelay: 1000,
    multipartUploadThreshold: 1048576, //(1 MB) 
    multipartUploadSize: 1048576, // (1 MB) 
});

var s3obj = new AWS.S3({
    params: {
        Bucket: 'trajansmarket',
        Key: constants.awsPassword
    }
});

export default {
    create,
    syncImageToLocal,
    syncImagesToLocal,
    deleteImageFromLocal,
    setCroppedPath,
    uploadHomeBanner,
    createUserImage,
    createProfileBanner,
    uploadDocuments
};

function create(req, res) {
    var file = req.files.file;
    console.log(file);
    if (file.size > 2048576) {
        res.jsonp({
            success: false,
            data: null,
            errors: 'Image size too large must be less than 1MB'
        });
    } else {
        console.log(file.path);
        var body = fs.createReadStream(file.path);
        var key = uuid.v1() + '.' + file.extension;
        var upload = {
            Body: body,
            Key: key,
            CacheControl: 'public, max-age=31536000'
        };
        s3obj.upload(upload).send(function(err, data) {
            var upload = null;

            if(req.body.listingId) {
                upload = new Upload({
                    userId: req.user._id,
                    listingId: req.body.listingId,
                    username: req.user.username,
                    path: location,
                    type: 'listingimage',
                    originalname: file.originalname,
                    key: key
                });
            } else {
                upload = new Upload({
                    userId: req.user._id,
                    username: req.user.username,
                    path: location,
                    type: 'listingimage',
                    originalname: file.originalname,
                    key: key
                });
            }
            upload.save(function(err, doc) {
                if (err) return err;
                unlinkFile(file);
                res.jsonp({
                    success: true,
                    data: {
                        doc: doc,
                        file: file,
                        location: location
                    },
                    errors: null
                });
            });

        });
    }
}

async function syncImageToLocal(req, res, next, path) {
    try {
        let key = path.substring(path.lastIndexOf('/') + 1);

        //TODO
        //fs.ensureDirSync(folderPath);

        let localPath = `public/imagesprecrop/${key}`;

        let fileName = `/imagesprecrop/${key}`;

        let file = fs.createWriteStream(localPath);

        s3obj.getObject({Key: key}).createReadStream().pipe(file);

        return new Promise((resolve, reject) => {
            file.on('close', function(){
                return resolve(uploadRepository.updateImageLocalPath(path, fileName));
            });
        })
        .then((upload) => {
            helper.sendData(upload, res);
        });
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

function syncImagesToLocal(req, res, next, listingId) {
    Listing.findById(listingId).populate('images').exec(function(err, listing){

        if(err) {

            console.log(err);
            return res.status(400).send({
                message: helper.getErrorMessage(err)
            });

        } else {

            _.forEach(listing.images, function(img){
                var key = path.substring(path.lastIndexOf('/')+1);
                var localPath = 'public/imagesprecrop/' + key;
                var fileName = '/imagesprecrop/' + key;

                var file = fs.createWriteStream(localPath);

                s3obj.getObject({Key: key}).createReadStream().pipe(file);

                img.localPath = fileName;
                img.save();
            });

            res.jsonp(listing);
        }

    });
}

function deleteImageFromLocal(req, res, next, localPath) {
    var path = 'public/' + localPath;
    fs.unlink(path, function(err) {
        if (err) {
            console.log(err);
            return res.status(400).send({
                message: helper.getErrorMessage(err)
            });
        } else {
            res.jsonp({success: true});
        }
    });
}

function setCroppedPath(req, res) {
    console.log('test');

    var keyCropped = '';

    var upload = req.body;

    var tempPath = 'public/tempimages/' + upload._id + upload.extension;

    fs.writeFile(tempPath, upload.base64, 'base64', function(err){
        if(err) {
            console.log(err);
            return res.status(400).send({
                message: helper.getErrorMessage(err)
            });
        }
        var body = fs.createReadStream(tempPath);
        var key = uuid.v1() + '.' + upload._id + '-cropped' + upload.extension;
        var uploadParams = {
            Body: body,
            Key: key,
            CacheControl: 'public, max-age=31536000'
        };
        s3obj.upload(uploadParams).send(function(err, data) {
            if(err) {
                console.log(err);
                return res.status(400).send({
                    message: helper.getErrorMessage(err)
                });
            }
            Upload.findByIdAndUpdate(upload._id, {'croppedPath': data.Location}, function(err, image){
                if(err) {
                    console.log(err);
                    return res.status(400).send({
                        message: helper.getErrorMessage(err)
                    });
                }

                unlinkSingleFile(tempPath);
                res.jsonp({
                    success: true,
                    data: {
                        image: image,
                        location: data.Location
                    },
                    errors: null
                });
            });
        });
    });
}

function uploadHomeBanner(req, res) {
    var files = req.files;
    var user = req.user;
    var userPath = 'public/homebanneruploads/homebanner.' + files.file.extension;
    var fileName = 'homebanneruploads/homebanner.' + files.file.extension;
    fs.exists(userPath, function(exists) {
        if (exists) {
            fs.unlink(userPath, function(err) {
                if (err) {
                    console.log(err);
                    return res.status(400).send({
                        message: helper.getErrorMessage(err)
                    });
                }
                fsextra.readFile(files.file.path, function(err, data) {
                    fsextra.writeFile(userPath, data, function(err, data) {
                        if (err) {
                            console.log(err);
                            return res.status(400).send({
                                message: helper.getErrorMessage(err)
                            });
                        }
                    });
                });
            });
        } else {
            fsextra.readFile(files.file.path, function(err, data) {
                if (err) {
                    console.log(err);
                    return res.status(400).send({
                        message: helper.getErrorMessage(err)
                    });
                }
                fsextra.writeFile(userPath, data, function(err, data) {
                    if (err) {
                        console.log(err);
                        return res.status(400).send({
                            message: helper.getErrorMessage(err)
                        });
                    }
                });
            });
        }

        SiteDefault.find({}, function(err, defaults) {
            SiteDefault.findOneAndUpdate(defaults, {
                bannerStyle: {
                    backgroundImage: userPath
                }
            }, function(err, defaults) {
                console.log(defaults);
            });
        });
    });
}

function createUserImage(req, res) {
    var file = req.files.file;
    if (file.size > 2048576) {
        res.jsonp({
            success: false,
            data: null,
            errors: 'Image size too large must be less than 1MB'
        });
    } else {
        var body = fs.createReadStream(file.path);
        var key = uuid.v1() + '.' + file.extension;
        var upload = {
            Body: body,
            Key: key,
            CacheControl: 'public, max-age=31536000'
        };
        s3obj.upload(upload).send(function(err, data) {
            var upload = new Upload({
                userId: req.user._id,
                username: req.user.username,
                path: data.Location,
                type: 'userimage',
                originalname: file.originalname,
                key: key
            });
            upload.save(function(err, upload) {
                User.findOneAndUpdate({
                    _id: req.user._id
                }, {
                    profileImage: data.Location
                }, function(err, user) {
                    if (err) {
                        return res.status(400).send({
                            message: 'Oops something went wrong!'
                        });
                    } else {
                        unlinkFile(file);
                        res.jsonp({
                            success: true,
                            data: {
                                doc: upload,
                                file: file,
                                location: data.Location
                            },
                            errors: null
                        });
                    }
                });
            });
        });
    }
}

function createProfileBanner(req, res) {
    var file = req.files.file;
    if (file.size > 2048576) {
        res.jsonp({
            success: false,
            data: null,
            errors: 'Image size too large must be less than 1MB'
        });
    } else {
        var body = fs.createReadStream(file.path);
        var key = uuid.v1() + '.' + file.extension;
        var upload = {
            Body: body,
            Key: key,
            CacheControl: 'public, max-age=31536000'
        };
        s3obj.upload(upload).send(function(err, data) {
            var upload = new Upload({
                userId: req.user._id,
                username: req.user.username,
                path: data.Location,
                type: 'userbanner',
                originalname: file.originalname,
                key: key
            });
            upload.save(function(err, upload) {
                User.findOneAndUpdate({
                    _id: req.user._id
                }, {
                    userBannerName: data.Location
                }, function(err, user) {
                    if (err) {
                        return res.status(400).send({
                            message: 'Oops something went wrong!'
                        });
                    } else {
                        unlinkFile(file);
                        res.jsonp({
                            success: true,
                            data: {
                                doc: upload,
                                file: file,
                                location: data.Location
                            },
                            errors: null
                        });
                    }
                });
            });
        });
    }
}

function uploadDocuments(req, res) {
    var files = req.files;
    var user = req.user;
    var userPath = 'uploads/' + user._id + '/' + files.file.originalname;
    fs.exists(userPath, function(exists) {
        if (exists) {
            fs.unlink(userPath, function() {
                fsextra.move(files.file.path, userPath, function(err) {
                    if (err) {
                        throw err;
                    }
                });
            });
        } else {
            fsextra.move(files.file.path, userPath, function(err) {
                if (err) {
                    throw err;
                }
            });
        }
    });
}

//helper methods

function saveListingImage(user, path, uuid) {
    var imagePath = path.replace(/public\//g, '');
    var image = new ListingImage({
        username: user.username,
        userId: user._id,
        path: imagePath,
        primaryImage: false,
        uuid: uuid
    });
    image.save();
}

function unlinkFile(file) {
    var dir = appDir + '/uploads/' + file.name;
    fsextra.remove(dir, function(err) {
        if (err) {
            console.log(err);
        }
    });
}

function unlinkSingleFile(path) {
    fs.unlink(path, function(err) {
        if (err) {
            console.log(err);
        }
    });
}

var toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

function getPathFromUrl(url) {
    return url.split('/')[2];
}
