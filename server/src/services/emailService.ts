import * as _ from 'lodash';
import * as nodemailer from 'nodemailer';
import * as openpgp from 'openpgp';
import * as dateFns from 'date-fns';
import * as fs from 'fs-extra';

import config from '../config/config';
import pathHelper from '../helpers/pathHelper';

let mandrill = require('mandrill-api/mandrill');
let mandrill_client = new mandrill.Mandrill('OaizhwvthLKLVAj1F7n2DA');

export default {
    sendMandrillEmail
}

async function sendMandrillEmail(options) {
    let pgpKey = options.pgpKey;

    try {
        let getTemplateList = () => new Promise((resolve, reject) => {
            mandrill_client.templates.list((data) => resolve(data), (err) => reject(err));
        });

        let templates = await getTemplateList();

        let template = _.filter(templates, (template) => {
            return template.name === options.templateName;
        })[0];

        let renderTemplate = (options) => new Promise((resolve, reject) => {
            mandrill_client.templates.render(options, (data) => resolve(data), (err) => reject(err));
        });

        let templateRender: any = await renderTemplate({
            'template_name': options.templateName,
            'template_content': [],
            'merge_vars': options.merge_vars
        });

        let emailHTML = templateRender.html;
        let subject = template.name;

        if (template.subject && template.subject.length) {
            subject = template.subject;
        }

        let smtpTransport = nodemailer.createTransport(config.email.options);

        let mailOptions: any = {
            to: options.recipientEmail,
            from: config.email.from,
            subject: subject || 'Email error - Missing to: address'
        };

        if (options.text) {
            mailOptions.text = emailHTML;
        } else {
            mailOptions.html = emailHTML;
        }

        if (config.email.useStubs && config.isDevLocal) {
            await sendStubEmail(mailOptions);
        } else {
            if (pgpKey) {
                await sendEncryptedEmail(pgpKey, smtpTransport, mailOptions);
            } else {
                await sendEmail(smtpTransport, mailOptions);
            }
        }
    } catch (err) {
        console.log('A mandrill error occurred: ' + err.name + ' - ' + err.message);
    }
}

function sendSmtpTransportEmail(smtpTransport, options) {
    return new Promise((resolve, reject) => {
        smtpTransport.sendMail(options, (err) => {
            if (err) return reject(err);

            return resolve();
        })
    });
}

async function sendEncryptedEmail(pgpKey, smtpTransport, mailOptions) {
    try {
        let publicKey = openpgp.key.readArmored(pgpKey);

        let pgpMessage = await openpgp.encryptMessage(publicKey.keys, mailOptions.text);

        mailOptions.text = pgpMessage;

        await sendSmtpTransportEmail(smtpTransport, mailOptions);

        console.log('PGP Encrypted Email Sent Successfully.');
    } catch (error) {
        console.log('There was an error encrypting the message!');
    } finally {
        smtpTransport.close();
    }
}

async function sendEmail(smtpTransport, mailOptions) {
    try {
        await sendSmtpTransportEmail(smtpTransport, mailOptions);

        console.log('Email Sent Successfully.');
    } catch (error) {
        console.log('There was an error sending email!');
    } finally {
        smtpTransport.close();
    }
}

async function sendStubEmail(mailOptions) {
    try {
        let {to, from, subject, text, html} = mailOptions;

        let nowDateStr = dateFns.format(new Date(), 'DD-MM_HH-mm-ss');
        let fileName = `${nowDateStr}_${to}_${subject}`;
        let isHtml = !!html;

        if (isHtml) {
            fileName += '.html';
        } else {
            fileName += '.txt';
        }

        let emailStubsFolder = pathHelper.getLocalRelative('./emails');

        fs.ensureDirSync(emailStubsFolder);

        let filePath = pathHelper.getLocalRelative('./emails', fileName);

        fs.writeFileSync(filePath, isHtml ? html : text);
    } catch (err) {
        console.log('Cannot send stub email.')
    }
}

