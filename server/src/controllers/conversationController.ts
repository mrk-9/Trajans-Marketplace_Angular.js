import * as mongoose from 'mongoose';

import emailMerges from '../emails/emailMerges';
import emailService from '../services/emailService';

let Conversation = mongoose.model('Conversation');
let User = mongoose.model('User');
let Text = mongoose.model('Text');

export default {
    create,
    list,
    listBetween,
    addMessageToConversation
};

function create(req, res) {
    var message = new Text();
    message.to = req.body.to.toString();
    message.from = req.user._id.toString();
    message.message = req.body.message;
    message.save(function(err, message) {
        if (err) {
            res.jsonp({
                success: false,
                errors: err,
                data: null
            });
        } else {
            var conversation = new Conversation();
            conversation.subject = req.body.subject;
            conversation.messages.push(message._id);
            conversation.from = req.user._id;
            conversation.to = req.body.to;
            conversation.save(function(err, conversation) {
                User.findById(req.body.to, function(err, user) {
                    
                    // Send email to notify recipient of new message
                	var merge_vars = emailMerges.messageReceived(user.firstName, req.user.username);

                    var mailOptions = {
                        user: user,
                        recipientEmail: user.email,
                        templateName: 'Message received (User/Merchant)',
                        merge_vars: merge_vars
                    };

                    emailService.sendMandrillEmail(mailOptions);

                });
                res.jsonp({
                    success: true,
                    errors: null,
                    data: conversation
                });
            });
        }
    });
}

function list(req, res) {
    if (req.user) {
        Conversation.find({
            $or: [{
                'from': req.user._id.toString()
            }, {
                'to': req.user._id.toString()
            }]
        }).populate('messages').populate('from', 'username').populate('to', 'username').populate('attachments').sort({
            created: -1
        }).exec(function(err, conversations) {
            Conversation.populate(conversations, {
                path: 'messages.from',
                model: 'User',
                select: 'username'
            }, function(err, conversations) {
                if (err) {
                    res.jsonp({
                        success: false,
                        errors: 'Error Getting Conversation',
                        data: null
                    });
                } else {
                    res.jsonp({
                        success: true,
                        errors: null,
                        data: conversations
                    });
                }
            });
        });
    } else {
        res.jsonp({
            success: false,
            errors: 'Not logged in',
            data: null
        });
    }
}

function listBetween(req, res) {
    if (req.user) {
        var userId = req.query.userId;
        Conversation.find({
            type: {
                $ne: 'order'
            }
        }).or([{
            $and: [{
                from: req.user._id
            }, {
                to: userId
            }]
        }, {
            $and: [{
                from: userId
            }, {
                to: req.user._id
            }]
        }]).populate('messages').populate('from', 'username').populate('to', 'username').populate('attachments').sort({
            created: -1
        }).exec(function(err, conversations) {
            Conversation.populate(conversations, {
                path: 'messages.from',
                model: 'User',
                select: 'username'
            }, function(err, conversations) {
                if (err) {
                    res.jsonp({
                        success: false,
                        errors: 'Error Getting Conversation',
                        data: null
                    });
                } else {
                    res.jsonp({
                        success: true,
                        errors: null,
                        data: conversations
                    });
                }
            });
        });
    } else {
        res.jsonp({
            success: false,
            errors: 'Not logged in',
            data: null
        });
    }
}

function addMessageToConversation(req, res) {
    var from, to, message, id;
    message = req.body.message;
    id = req.body.id;
    to = req.body.to;
    Conversation.findById(id, function(err, conversation) {
        if (err) {
            res.jsonp({
                success: false,
                errors: 'Error Adding Message to Conversation',
                data: null
            });
        } else {
            if (req.user._id.toString() === conversation.from.toString() || req.user._id.toString() === conversation.to.toString()) {
                from = req.user._id;
                var newMessage = new Text({
                    to: to,
                    from: from,
                    message: message
                });
                newMessage.save(function(err, message) {
                    if (err) {
                        res.jsonp({
                            success: false,
                            errors: err,
                            data: null
                        });
                    } else {
                        conversation.messages.push(message);
                        conversation.save(function(err, conversation) {
                            if (err) {
                                res.jsonp({
                                    success: false,
                                    errors: 'Error Adding Message to Conversation',
                                    data: null
                                });
                            } else {
                                // Send email to notify recipient of new message
                                User.findById(to, function(err, user) {

                                    var merge_vars = emailMerges.messageReceived(user.firstName, req.user.username);

                                    var mailOptions = {
                                        user: user,
                                        recipientEmail: user.email,
                                        templateName: 'Message received (User/Merchant)',
                                        merge_vars: merge_vars
                                    };

                                    emailService.sendMandrillEmail(mailOptions);
                                });

                                res.jsonp({
                                    success: true,
                                    errors: null,
                                    data: {
                                        conversation: conversation,
                                        message: message,
                                        from: req.user.username
                                    }
                                });
                            }
                        });
                    }

                });
            } else {
                res.jsonp({
                    success: false,
                    errors: 'Not authorised',
                    data: null
                });
            }
        }
    });
}
