
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
    {
        question: { type: mongoose.SchemaTypes.ObjectId, ref: 'Question' },
        value: { type: String, enum: ['A','B','C','D'], uppercase: true }
    },
     { 
        _id: false 
    })

const testEntrySchema = new mongoose.Schema({
    // candidate: { type: mongoose.SchemaTypes.ObjectId, ref: 'Candidate' },
    refNumber: { type: Number },
    date: { type: Date, default: Date.now },
    answers: { type: [ answerSchema ], 
        validate: {
            validator: function(a){ return a.length <= this.test.noOfQuestions },
            message: 'You submitted more answers than there are questions'
        }
    },
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test'},
    score: { type: Number, min: 0, max: function(){ return this.noOfQuestions }, default: 0 },
    submitted: Boolean
});

const TestEntry = mongoose.model('TestEntry', testEntrySchema);

module.exports = TestEntry;