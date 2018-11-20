
const mongoose = require('mongoose');

const testSchema = new mongoose.Schema(
    {
        title: String,
        date: { type: Date },
        duration: { type: Number, min: 0, default: function(){ return this.noOfQuestions } }, // in minutes
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
    return this.questions ? this.questions.length : 0;
})

const Test = mongoose.model('Test', testSchema);

module.exports = Test;