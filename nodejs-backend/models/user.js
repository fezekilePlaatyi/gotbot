const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: String,
    lastName: String,
    profileImage: String,
    messages: Array,
    userInterfaceTheme: String,
    _id: String
});

mongoose.model('User', UserSchema);