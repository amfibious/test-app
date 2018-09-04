
const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    name: String,
    date: { type: Date, default: Date.now },
    duration: { type: Number, default: function(){ return this.noOfQuestions * 60 } },
    noOfQuestions: { type: Number, default: 5 },
    questions: { 
                    type: [ mongoose.Schema.Types.ObjectId ],
                    ref: 'Question',
                    validate:{
                        validator: function(q) { return q.length == this.noOfQuestions}
                    }
                },
    passMark: { type: Number, default: 0 },
    isNegMark: { type: Boolean, default: false }
});

const Test = mongoose.model('Test', testSchema);

module.exports = Test;