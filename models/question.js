
const Joi = require('joi');
const mongoose = require('mongoose');

//-----------------------------------------------------------------
const optionSchema = new mongoose.Schema(
    {
        value: { type: String, enum: ['A', 'B', 'C', 'D'], uppercase: true, trim: true, required: true},
        template: { 
            text: { type: String, required: true },
            figure: {
                data: Buffer,
                contentType: String
            }
        },
        isAnswer: { type: Boolean, required: true }
    }, 
    {
        _id: false
    });
 //-----------------------------------------------------------------
const questionSchema = new mongoose.Schema(
    {
        test: { type: mongoose.SchemaTypes.ObjectId, ref: 'Test' },
        number: { type: Number, required: true, min: 1,
            validate: {
                isAsync: true,
                validator: function(n, callback){
                    Question.findOne({ number: this.number}, (err, doc) => {
                        callback(!doc);
                    });
                },
                message: 'A question with this number already exists in the database'
            }
        },
        options: { 
            type: [optionSchema],
            validate: [{
                validator: function(ops){ 
                    return ops.map(op => op.value).join('').match(/ABCD?/);;
                },
                message: 'Options must have unique values from A to D in alphabetical order.'
            },
            {
                validator: function(ops){ 
                    return ops.filter(o => o.isAnswer).length === 1;
                },
                message: 'Question must have one and only one option as answer.'
            }]
        },
        difficulty: { type: Number, required: true, default: 3, min: 1, max: 5 },
        template: { 
            text: { type: String, required: true },
            figure: {
                data: Buffer,
                contentType: String
            }
        }
    }, 
    { 
        timestamps: true 
    });
//-----------------------------------------------------------------

const Option = mongoose.model('Option', optionSchema);
const Question = mongoose.model('Question', questionSchema);

function validateQuestion(){
    return Joi.validate(Question, {
        number: Joi.required().number()
    });
}

module.exports = { Question, validateQuestion }