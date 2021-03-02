const mongoose = require('mongoose');
const ProfileSchema = new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId,
    ref:'user',
    required:true},
    website:{type:String,required:true},
    location:{type:String,required:true},
    designation:{type:String,required:true},
    hobby:{type:[String],required:true},
    bio:{type:String,required:true},
    githubusername:{type:String,required:true},
    education:[
        {
            school:{type:String},
            degree:{type:String},
            filedOfStudy:{type:String},
            from:{type:String},
            to:{type:String},
            current:{type:String},
            description:{type:String},

        }
    ],
    social:[
        {
            youtube:{type:String},
            facebook:{type:String},
            instagram:{type:String},
            twitter:{type:String},
            linkedin:{type:String},
            whatsapp:{type:String},
        }
    ]
},{timestamps:true});

const Profile = mongoose.model('profile',ProfileSchema);
module.exports=Profile;