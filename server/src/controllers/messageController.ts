import * as mongoose from 'mongoose';
import helper from './_controllerHelper';
import sendEmail from '../services/emailService';

let Message = mongoose.model('Message');
let User = mongoose.model('User');

export default {
    create,
    contactSeller,
    read,
    deleteMessage,
    list,
    messageByID
};

function create(req, res) {
    var message = new Message(req.body);
    message.from = req.user.merchantName || req.user.username;
    message.senderId = req.user;

    message.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: helper.getErrorMessage(err)
            });
        } else {
            if(req.body.markAsReplied) {
                var query = {
                    _id: req.body.messageId
                };
                var update = {
                    replied: true
                };
                Message.findOneAndUpdate(query, update, null, function(err, message) {
                    if (err) {
                        console.log(err);                        
                        //TODO Send email to recipient
                    }
                });
            } else {
                // SEND MESSAGE RECEIVED CONFIRMATION EMAIL TO MERCHANT
                User.findOne({
                    '_id': message.recipientId
                }, function(err, user) {
                    if (err) return err;
                    var sellerEmail = user.email;
                    var merge_vars = [
                        { 'name': 'recipient', 'content': user.firstName },
                        { 'name': 'user', 'content': message.from }
                    ]; 
                    var mailOptions = { 
                        user: req.user,
                        recipientEmail: sellerEmail,
                        templateName : 'Message received (User/Merchant)',
                        merge_vars: merge_vars                     
                    };
                    sendEmail.sendMandrillEmail(mailOptions);
                });
            }
            res.jsonp(message);
        }
    });
}

//Create a Message to Seller
function contactSeller(req, res) {
    var message = new Message(req.body);
    message.from = req.user.merchantName || req.user.username;
    message.senderId = req.user;
    //TODO Waiting on the front end
    console.log('message contactSeller');
	res.send(200);
}

function read(req, res) {
    res.jsonp(req.message);
}

function deleteMessage(req, res) {
    var message = req.message;
    message.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: helper.getErrorMessage(err)
            });
        } else {
            res.jsonp(message);
        }
    });
}

function list(req, res, next) {
    Message.find({ 'recipientId': req.user._id }, { subject: 1, from: 1, created: 1, read: 1, replied : 1} ).sort('-created').populate('user', 'username').exec(function(err, messages) {
        if (err) { 
            return res.status(400).send({
                message: helper.getErrorMessage(err)
            });
        } else {
            res.jsonp(messages);
        }
    });
}

function messageByID(req, res, next, id) {
    Message.findById(id).exec(function(err, message) {
        if (err) return next(err);
        if (!message) return next(new Error('Failed to load Message ' + id));       
        message.read = true; // Mark Message As Read
        message.save();
        req.message = message;
        next();
    });
}
