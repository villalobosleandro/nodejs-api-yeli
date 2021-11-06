const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    }
});

userSchema.method('toJSON', function(){
    const { __v, ...object } = this.toObject();
    const { _id: id, ...result } = object;
    return { ...result, id };
});

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;