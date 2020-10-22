const nodemailer = require('nodemailer')
const moment = require('moment')

exports.sendEmail = async (to, subject, emailBody) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_FOR_NODEMAILER_USERNAME,
            pass: process.env.EMAIL_FOR_NODEMAILER_PASSWORD
        }
    });

    let mailOptions = {
        from: `Got Bot 🤖 - <${process.env.EMAIL_FOR_NODEMAILER_USERNAME}`,
        to: to,
        subject: subject,
        html: emailBody
    };

    return transporter.sendMail(mailOptions)
}

exports.buildEmailBodyOfChatTranscript = async (emailData) => {
    let messages = ''
    let emailHeading =
        `<p>Hi, <b>${emailData[0].firstName}  ${emailData[0].lastName}</b></p>
        <p>Please find Your Chat Script below of your recent communication with GotBot Agent</p>`

    emailData[0].messages.forEach((message) => {
        messages = messages +
            `<p> [${moment(message.timestamp).format('lll')}] 
                ${message.sender.id == process.env.ROBOT_USER_ID ? '<b>Gotbot Agent - </b>' : '<b>You -</b>'} 
                ${message.message.text}
            </p>`
    })
    let emailBody = emailHeading + messages + process.env.END_OF_CHATSCRIPT_EMAIL
    return emailBody
}