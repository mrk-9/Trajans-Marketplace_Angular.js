import * as speakeasy from 'speakeasy';
import * as mongoose from 'mongoose';
let passport = require('passport');

import emailService from '../../services/emailService';
import emailMerges from '../../emails/emailMerges';
import utilityService from '../../services/utilitiesService';
import helper from '../_controllerHelper';
import userRepository from '../../repositories/userRepository';

let User = mongoose.model('User');

export default {
    signUp,
    resendVerificationEmail,
    validateEmailVerificationToken,
    toggleAuthentication,
    signin,
    signout,
    oauthCallback,
    saveOAuthUserProfile,
    removeOAuthProvider
};

async function signUp(req, res) {
    try {
        // For security measurement we remove the roles from the req.body object
        delete req.body.roles;

        let user = await userRepository.createUser(req.body);

        await sendVerificationEmail(user.email, req.headers.host);

        // Remove sensitive data before login
        user.password = undefined;
        user.salt = undefined;

        let loginUser = await helper.reqLogin(req, user);

        return helper.sendData(loginUser, res);
    } catch (err) {
        return helper.sendFailureMessage(err, res);
    }
}

async function resendVerificationEmail(req, res) {
    try {
        let email = req.body.userEmail;

        if (!email) throw new Error('Email field must not be blank');

        await sendVerificationEmail(email, req.headers.host);

        return helper.sendData({}, res);
    } catch (err) {
        return helper.sendFailureMessage(err, res);
    }
}

async function validateEmailVerificationToken(req, res) {
    try {
        let token = req.params.token;

        if (!token) throw new Error('Verification Token is required');

        let user = await userRepository.getUserByToken(token);

        if (!user) return res.redirect('/#!/verify_account/invalid');

        await userRepository.updateUserToken(user._id, null, true);

        sendWelcomeEmail(user);

        let url = `/#!/verifyaccount/${token}`;

        res.redirect(url);
    } catch (err) {
        return helper.sendFailureMessage(err, res);
    }
}

function toggleAuthentication(req, res) {
    let randomCode = req.query.randomCode;
    let toggle = req.query.toggle;
    let user = req.user;
    let userCode = speakeasy.time({
        key: req.user.faBase32,
        encoding: 'base32'
    });

    if (userCode === randomCode) {
        User.update({
            _id: user.id
        }, { faEnabled: toggle }, function(err) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.jsonp({
                    success: true,
                    toggle: toggle,
                    message: 'Settings saved successfully!'
                });
            }
        });
    } else {
        res.jsonp({
            success: false,
            message: 'Codes did not match...'
        });
    }
}

/**
 * Signin after passport authentication
 */
function signin(req, res, next) {
    let fa = req.body.faRandomNumber;

    passport.authenticate('local', function(err, user, info) {
        if (err || !user) {
            console.log(info);
            res.status(400).send(info);
        } else {
            // Remove sensitive data before login
            user.password = undefined;
            user.salt = undefined;
            user.username.toLowerCase();

            if (fa) {
                let userCode = speakeasy.time({
                    key: user.faBase32,
                    encoding: 'base32'
                });

                if (userCode === fa) {
                    req.login(user, function(err) {
                        if (err) {
                            console.log(err);
                            res.status(400).send(err);
                        } else {
                            res.jsonp(user);
                        }
                    });
                } else {
                    res.jsonp({
                        gaMessage: {
                            showTwoFactor: true,
                            message: 'Authentication code did not match...'
                        }
                    });
                }
            } else {
                // Check authentication
                if (user.faEnabled) {
                    user = {};
                    res.jsonp({
                        gaMessage: {
                            showTwoFactor: true,
                            message: 'Enter two factor authentication number...'
                        }
                    });
                } else {
                    req.login(user, function(err) {
                        if (err) {
                            console.log(err);
                            res.status(400).send(err);
                        } else {
                            res.jsonp(user);
                        }
                    });
                }
            }
        }
    })(req, res, next);
}

function signout(req, res) {
    req.logout();
    res.redirect('/');
}

function oauthCallback(strategy) {
    return function(req, res, next) {
        passport.authenticate(strategy, function(err, user, redirectURL) {
            if (err || !user) {
                return res.redirect('/#!/signin');
            }
            req.login(user, function(err) {
                if (err) {
                    return res.redirect('/#!/signin');
                }

                return res.redirect(redirectURL || '/#!/merchantsetup');
            });
        })(req, res, next);
    };
}

/**
 * Helper function to save or update a OAuth user profile
 */
function saveOAuthUserProfile(req, providerUserProfile, done) {
    if (!req.user) {
        // Define a search query fields
        let searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
        let searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

        // Define main provider search query
        let mainProviderSearchQuery: any = {};
        mainProviderSearchQuery.provider = providerUserProfile.provider;
        mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

        // Define additional provider search query
        let additionalProviderSearchQuery = {};
        additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

        // Define a search query to find existing user with current provider profile
        let searchQuery = {
            $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
        };

        User.findOne(searchQuery, function(err, user) {
            if (err) {
                return done(err);
            } else {
                if (!user) {
                    let possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

                    User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
                        user = new User({
                            firstName: providerUserProfile.firstName,
                            lastName: providerUserProfile.lastName,
                            username: availableUsername,
                            displayName: providerUserProfile.displayName,
                            email: providerUserProfile.email,
                            provider: providerUserProfile.provider,
                            providerData: providerUserProfile.providerData
                        });


                        // And save the user
                        user.save(function(err) {
                            return done(err, user);
                        });
                    });
                } else {
                    return done(err, user);
                }
            }
        });
    } else {
        // User is already logged in, join the provider data to the existing user
        let user = req.user;

        // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
        if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
            // Add the provider data to the additional provider data field
            if (!user.additionalProvidersData) user.additionalProvidersData = {};
            user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

            // Then tell mongoose that we've updated the additionalProvidersData field
            user.markModified('additionalProvidersData');

            // And save the user
            user.save(function(err) {
                return done(err, user, '/#!/settings/accounts');
            });
        } else {
            return done(new Error('User is already connected using this provider'), user);
        }
    }
}

function removeOAuthProvider(req, res, next) {
    let user = req.user;
    let provider = req.param('provider');

    if (user && provider) {
        // Delete the additional provider
        if (user.additionalProvidersData[provider]) {
            delete user.additionalProvidersData[provider];

            // Then tell mongoose that we've updated the additionalProvidersData field
            user.markModified('additionalProvidersData');
        }

        user.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: helper.getErrorMessage(err)
                });
            } else {
                req.login(user, function(err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        res.jsonp(user);
                    }
                });
            }
        });
    }
}

//helper methods
async function sendVerificationEmail(email, host) {
    let token = await utilityService.generateRandomToken();

    let user = await userRepository.getUserByEmail(email);

    if (!user) throw new Error('No account with that email has been found.');

    if (user.provider !== 'local') throw new Error(`It seems like you signed up using your ${user.provider} account.`);

    await userRepository.updateUserToken(user._id, token, false);

    let url = `http://${host}/auth/verifyaccount/${token}`;

    let mergeVarsVerify = emailMerges.verifyAccount(user.firstName, url);

    let mailOptionsVerify = {
        user: user,
        recipientEmail: user.email,
        templateName: 'Verify account creation',
        merge_vars: mergeVarsVerify
    };

    emailService.sendMandrillEmail(mailOptionsVerify);
}

async function sendWelcomeEmail(user) {
    let mergeVars = emailMerges.newUser(user.firstName);

    let mailOptions = {
        user: user,
        recipientEmail: user.email,
        templateName: 'Welcome email (User)',
        merge_vars: mergeVars
    };

    emailService.sendMandrillEmail(mailOptions);
}