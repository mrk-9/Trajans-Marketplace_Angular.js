import * as mongoose from 'mongoose';
import * as _ from 'lodash';

import helper from './_controllerHelper';
import siteDefaultsRepository from '../repositories/siteDefaultsRepository';
import userRepository from '../repositories/userRepository';
import listingRepository from '../repositories/listingRepository';
import featuredRepository from '../repositories/featuredRepository';

var Users = mongoose.model('User');
var SiteDefaults = mongoose.model('SiteDefault');
var User = mongoose.model('User');
var fs = require('fs');
var zipFolder = require('zip-folder');
var mime = require('mime');
var path = require('path');
var appDir = path.dirname(require.main.filename);

export default {
    read,
    updateUser,
    userByID,
    listUsers,
    userDocumentsByID,
    hasAdminAuthorization,
    getSiteDefaults,
    updateTypewriter,
    updateBannerStyles
};


function read(req, res) {
    res.jsonp(req.user);
}

async function updateUser(req, res) {
    try {
        let userId = req.body._id;

        // For security measurement we remove the roles from the req.body object
        delete req.body._id;

        let userData = req.body;

        let user = await userRepository.updateUser(userId, userData);

        await listingRepository.updateVerifiedStatus(userId, user.verified);

        if (!user.featuredMerchant) {
            await featuredRepository.removeFeature(null, userId);
        }

        helper.sendData(user, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

function userByID(req, res, next, id) {
    Users.findById(id).populate('user', 'username').exec(function(err, userProfile) {
        if (err) return next(err);
        if (!userProfile) return next(new Error('Failed to load User ' + id));
        res.jsonp(userProfile);
    });
}

async function listUsers(req, res) {
    try {
        let users = await userRepository.getUsersList();

        helper.sendData(users, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

function userDocumentsByID(req, res) {
    var userId = req.body.userDocId;
    var userPath = appDir + '/uploads/' + userId;
    var userPathZip = appDir + '/public/pdf/' + userId + '.zip';
    fs.exists(userPath, function (exists) {
        if(exists){
             zipFolder(userPath, userPathZip, function(err) {
                if (err) {
                    console.log(err);
                }
                res.download(userPathZip, 'documents.zip', function(err){
                    if (err) {
                        console.log(err);
                      } else {
                        fs.unlinkSync(userPathZip);
                      }

                });
            });
        }
    });
}

/**
 * Require Admin login routing middleware
 */
function hasAdminAuthorization(req, res, next) {
    if (req.user &&  _.indexOf(req.user.roles, 'admin') !== -1) {
        next();
    } else {
        return res.status(403).send('User is not authorized');
    }
    
}

async function getSiteDefaults(req, res, next) {
    try {
        let defaults = await siteDefaultsRepository.getSiteDefaults();

        helper.sendData(defaults, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

function updateTypewriter(req, res, next) {
    var id = req.body._id;
    var enabled = req.body.typewriterEnabled;
    if(req.body.typewriterText) {
        var text = req.body.typewriterText;
        SiteDefaults.findByIdAndUpdate(id, {typewriterEnabled: enabled, typewriterText: text}, function(err, defaults){
            if(err) {
                console.log(err);
                return res.status(400).send({
                    message: helper.getErrorMessage(err)
                });
            } else {
                res.jsonp(defaults);
            }
        });
    } else if(!req.body.typewriterText) {
        SiteDefaults.findByIdAndUpdate(id, {typewriterEnabled: enabled}, function(err, defaults){
            if(err) {
                console.log(err);
                return res.status(400).send({
                    message: helper.getErrorMessage(err)
                });
            } else {
                res.jsonp(defaults);
            }
        });
    }
}

function updateBannerStyles(req, res, next) {
    var id = req.body._id;
    if(req.body.bannerStyle) {
        var styles = req.body.bannerStyle;
        SiteDefaults.findByIdAndUpdate(id, 
            {
                bannerStyle: {
                    transition: styles.transition,
                    backgroundColor: styles.backgroundColor,
                    backgroundImage: styles.backgroundImage
                }
            }, 
            function(err, defaults){
            if(err) {
                console.log(err);
                return res.status(400).send({
                    message: helper.getErrorMessage(err)
                });
            } else {
                res.jsonp(defaults);
            }
        });
    }
}

