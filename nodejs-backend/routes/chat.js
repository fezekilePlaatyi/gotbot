'use strict';

require('dotenv').config()
require('../models/user.js')

const
    request = require('request'),
    PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN,
    mongoose = require('mongoose'),
    nodeMailer = require('../routes/email.js'),
    User = mongoose.model('User')

exports.sendChatScriptToEmail = async (req, res) => {
    console.log('[Chat Bot] -- onEmail Chatscript handler')
    let { userEmailAddress, userIdToGetChatWith } = req.body

    getChatHistoryWithUser(userIdToGetChatWith).then((data) => {

        nodeMailer.buildEmailBodyOfChatTranscript(data).then((emailBody) => {
            nodeMailer.sendEmail(userEmailAddress, process.env.CHAT_SCRIPT_EMAIL_SUBJECT, emailBody).then((response) => {
                response.accepted.length > 0 ? res.json('sent') : res.json('error')
            })
        })

    })
}

exports.getChatHistoryWithUserById = async (req, res) => {
    let userIdToGetChatWith = req.query.userId
    getChatHistoryWithUser(userIdToGetChatWith).then((data) => {
        res.send({ data })
    })
}

exports.incomingChatHandler = (req, res) => {
    console.log('[Chat Bot] -- onComing Messages Handler()')
    let body = req.body
    const io = req.app.locals.io

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {

        body.entry.forEach(function (entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0]

            // Check if the event is a message and send it to socket client
            if (webhook_event.message) {

                if (!webhook_event.message.is_echo) {
                    console.log('[Chat Bot] -- Message -- from other user')

                    let documentId = webhook_event.sender.id

                    checkIfUserExists(documentId).then((response) => {
                        if (!Object.keys(response).length) {
                            console.log('[Chat Bot] -- Message -- from new user')
                            
                            storeUserProfile(documentId).then(response=> {
                                if(response == 'saved') {

                                    console.log('[Chat Bot] -- Message -- User saved')
                                    
                                    storeMessageToDb(documentId, webhook_event)
                                    .then(response=> {
                                        console.log(`Status: ${response}`)
                                        getChatHistoryWithUser(documentId).then((data) => {
                                            io.emit('messageFromNewUser', data)
                                        })
                                    })
                                    
                                } else {
                                    console.log(`An Error occured while saving User ${response}`)
                                    /*
                                        Idealy this should email error to system admin
                                        so that they know about this error which occured
                                        on saving new user
                                    */
                                }

                            })

                        } else {
                            console.log('[Chat Bot] -- Message -- from existing user')

                            io.emit('messageFromExistingUser', { webhook_event_content: webhook_event })
                            storeMessageToDb(documentId, webhook_event)
                        }
                    })                    
                } else {
                    console.log('[Chat Bot] -- Message -- from robot messenger page')

                    let documentId = webhook_event.recipient.id
                    storeMessageToDb(documentId, webhook_event)
                }
            }
        })
        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED')

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404)
    }
}

exports.sendMessageToUser = (receiverId, messageContent) => {
    callSendAPI(receiverId, messageContent)
}

const callSendAPI = (sender_psid, response) => {
    // Construct the message body
    let request_body = {
        recipient: { id: sender_psid },
        message: {
            text: response
        }
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log(`[Chat Bot] -- Message sent!`)
        } else {
            console.error(`[Chat Bot] -- Unable to send message: ${err}`);
        }
    });
}

const storeMessageToDb = async (documentId, data) => {
    var query = { _id: documentId }
    var newMessage = { $push: { messages: data } }
    
    return new Promise((resolve, rejects) => {
        User.updateOne(query, newMessage, function (err, res) {
            if (err) {
                console.log(`Error occured while saving message ${err.message}`)
                rejects(err)
            } else {
                console.log('[Chat Bot] -- Inserted message')
                resolve(res)
            }
        });
    })
    
}

const checkIfUserExists = (userId) => {
    return User.find({ _id: userId }, { _id: 1 }).limit(1)
}

const getChatHistoryWithUser = (userId) => {
    return User.find({ _id: userId })
}

const storeUserProfile = (userId) => {

    return new Promise((resolve, reject) => {

        getUserProfile(userId).then((data) => {
            let { first_name, last_name, profile_pic, id } = data
            let user = User({ firstName: first_name, lastName: last_name, profileImage: profile_pic, _id: userId })
            
            user.save().then( () => {
                resolve('saved')
            }).catch( (error) => {
                reject(error)
                console.log(`There was an error ${error.message}`)
            });
        })

    })
}

const getUserProfile = async (userId) => {

    const options = {
        url: "https://graph.facebook.com/v2.6/" + userId + "?",
        qs: {
            access_token: PAGE_ACCESS_TOKEN
        },
        headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
            'User-Agent': 'test-bot'
        },
        method: "GET",
        json: true,
        time: true
    }

    return new Promise(function (resolve, reject) {
        request.get(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        })
    })
}

exports.verifyMessangerWebHook = (req, res) => {

    const CHAT_VERIFY_TOKEN = process.env.CHAT_VERIFY_TOKEN

    let mode = req.query['hub.mode']
    let token = req.query['hub.verify_token']
    let challenge = req.query['hub.challenge']

    // Check if a token and mode were sent
    if (mode && token) {

        // Check the mode and token sent are correct
        if (mode === 'subscribe' && token === CHAT_VERIFY_TOKEN) {
            // Respond with 200 OK and challenge token from the request
            console.log('[Chat Bot] -- WEBHOOK_VERIFIED')
            res.status(200).send(challenge)

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403)
        }
    }
}
