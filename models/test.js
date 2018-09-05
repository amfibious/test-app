
const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    name: String,
    date: { type: Date, default: Date.now },
    duration: { type: Number, default: function(){ return this.noOfQuestions * 60 } },
    questions: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Question' } ],
    passMark: { type: Number, default: 0 },
    isNegMark: { type: Boolean, default: false }
});
testSchema.virtual('noOfQuestions').get(function(){
    return this.questions.length;
})

const Test = mongoose.model('Test', testSchema);

module.exports = Test;