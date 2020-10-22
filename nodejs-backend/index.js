'use strict';

require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const dbHost = process.env.MONGO_URL
mongoose.connect(dbHost, { useUnifiedTopology: true, useNewUrlParser: true })

const cors = require('cors')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const index = require('./routes/index.route')
const chat =  require('./routes/chat')
const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

app.use('/', index)
app.post('/chat_bot', chat.incomingChatHandler)
app.get('/chat_bot', chat.verifyMessangerWebHook)
app.get('/getChatHistoryWithUser', chat.getChatHistoryWithUserById)
app.post('/sendChatScriptWithUser', chat.sendChatScriptToEmail)

io.on('connection', (socket) => {
    socket.on('messageFromBotClientApp', (data) => {
        chat.sendMessageToUser(data.receiverId, data.messageContent)
    })
})

server.listen(port, () => {
    console.log(`\x1b[33m`, `[Chat Bot] -- Server started at port ${port}`)
});

app.locals.io = io




