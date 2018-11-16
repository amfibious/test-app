
const mongoose = require('mongoose');

//-----------------------------------------------------------------
const answerSchema = new mongoose.Schema(
    {
        question: { type: mongoose.SchemaTypes.ObjectId, ref: 'Question' },
        value: { type: String, enum: ['A','B','C','D'], uppercase: true }
    },
     { 
        _id: false,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    });

answerSchema.virtual('correct').get(function(){
    let rightValue = this.question.options.find(o => o.isAnswer).value;
    return this.value === rightValue;
})
//-----------------------------------------------------------------
const testEntrySchema = new mongoose.Schema({
    candidate: { type: mongoose.SchemaTypes.ObjectId, ref: 'Candidate' },
    refNumber: { type: Number },
    answers: { type: [ answerSchema ], default: [],
        validate: {
            validator: function(a){ return a.length <= this.test.noOfQuestions },
            message: 'You submitted more answers than there are questions'
        }
    },
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test'},
    // score: { type: Number, min: 0, max: function(){ return this.noOfQuestions }, default: 0 },
    submitted: Boolean
}, 
{ timestamps: true });

testEntrySchema.virtual('timeExpired').get(function(){
    return (this.createdAt.value + (this.test.duration * 60 * 1000) ) >= Date.now();
});

testEntrySchema.virtual('score').get(function(){
    return this.answers.filter(a => a.correct).length
});

//-----------------------------------------------------------------

const TestEntry = mongoose.model('TestEntry', testEntrySchema);

module.exports = TestEntry;