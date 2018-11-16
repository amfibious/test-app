
const mongoose = require('mongoose');

const testSchema = new mongoose.Schema(
    {
        title: String,
        date: { type: Date },
        duration: { type: Number, default: function(){ return this.noOfQuestions * 60 } }, // in minutes
        questions: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Question' } ],
        passMark: { type: Number, default: 0 },
        isNegMark: { type: Boolean, default: false },
        strict: { type: Boolean, default: false },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }, 
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        timestamps: true
    });

testSchema.virtual('numberOfQuestions').get(function(){
    return this.questions.length;
})

const Test = mongoose.model('Test', testSchema);

module.exports = Test;