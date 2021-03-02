const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User');
const authenticate = require('../middlewares/authenticate');
const {body,validationResult} =require('express-validator');
/*
    Usage :Get a Profile
    Url : api/profiles/me
    Fields : no fields
    Method : GET
    Access : Private
 */
router.get('/me',authenticate,async (request,response)=>{
   try {
       let profile = await Profile.findOne({user:request.user.id}).populate('user',['name','avatar']);
       if (!profile){
           return response.status(400).json({errors:[{msg:'No Profile Found'}]})
       }
       response.status(200).json({profile:profile})
   } 
   catch (error) {
       console.error(error);
       response.status(500).json({errors:[{msg:error.message}]});
   }
});

/*
    Usage :Create a Profile
    Url : api/profiles/
    Fields : website , location , designation , hobby , bio ,
             githubUsername, youtube , facebook , twitter ,
             linkedin , instagram , whatsapp
    Method : Post
    Access : Private
 */
router.post('/',[
    body('website').notEmpty().withMessage('if you dont have website use www.google.com'),
    body('location').notEmpty().withMessage('Location is Required'),
    body('designation').notEmpty().withMessage('Designation is Required'),
    body('hobby').notEmpty().withMessage('Hobby is Required'),
    body('bio').notEmpty().withMessage('Bio is Required')
],authenticate,async (request,response)=>{
    let errors = validationResult(request);
    if (!errors.isEmpty()){
        return response.status(401).json({errors:errors.array()});
    }
   try {
        let {website , location , designation , hobby , bio , githubusername ,
            youtube , facebook, twitter , linkedin , instagram , whatsapp} = request.body;


        let profileObj = {};
        profileObj.user = request.user.id; //id get from token
       if (website) profileObj.website = website;
       if (location) profileObj.location = location;
       if (designation) profileObj.designation = designation;
       if (hobby) profileObj.hobby = hobby.toString().split(',').map(hobby=>hobby.trim());
       if (bio) profileObj.bio = bio;
       if (githubusername) profileObj.githubusername = githubusername;

       //socaial Object
       profileObj.social ={};
       if (youtube) profileObj.social.youtube = youtube;
       if (facebook) profileObj.social.facebook = facebook;
       if (twitter) profileObj.social.twitter = twitter;
       if (linkedin) profileObj.social.linkedin = linkedin;
       if (instagram) profileObj.social.instagram = instagram;
       if (whatsapp) profileObj.social.whatsapp = whatsapp;

       //insert to db
        let profile = new Profile(profileObj);
        profile = await profile.save();
        response.status(200).json({
            msg:'Profile is Created Successfully',
            profile:profile
        })
    }
   catch (error) {
       console.error(error);
       response.status(500).json({errors:[{msg:error.message}]});
   }
});

/*
    Usage :Update a Profile
    Url : api/profiles/
    Fields : website , location , designation , hobby , bio ,
             githubUsername, youtube , facebook , twitter ,
             linkedin , instagram , whatsapp
    Method : Put
    Access : Private
 */
router.put('/',[
    body('website').notEmpty().withMessage('if you dont have website use www.google.com'),
    body('location').notEmpty().withMessage('Location is Required'),
    body('designation').notEmpty().withMessage('Designation is Required'),
    body('hobby').notEmpty().withMessage('Hobby is Required'),
    body('bio').notEmpty().withMessage('Bio is Required')
],authenticate,async (request,response)=>{
    let errors = validationResult(request);
    if (!errors.isEmpty()){
        return response.status(401).json({errors:errors.array()});
    }
    try {
        let {website , location , designation , hobby , bio , githubUsername ,
            youtube , facebook, twitter , linkedin , instagram , whatsapp} = request.body;

        //cheak if profile exist
        let profile = await Profile.findOne({user:request.user.id});
        if (!profile){
            return response.status(401).json({errors:[{msg:"No Profile Found"}]});
        }

        let profileObj = {};
        profileObj.user = request.user.id; //id get from token
        if (website) profileObj.website = website;
        if (location) profileObj.location = location;
        if (designation) profileObj.designation = designation;
        if (hobby) profileObj.hobby = hobby.toString().split(',').map(hobby=>hobby.trim());
        if (bio) profileObj.bio = bio;
        if (githubUsername) profileObj.githubusername = githubUsername;

        //socaial Object
        profileObj.social ={};
        if (youtube) profileObj.social.youtube = youtube;
        if (facebook) profileObj.social.facebook = facebook;
        if (twitter) profileObj.social.twitter = twitter;
        if (linkedin) profileObj.social.linkedin = linkedin;
        if (instagram) profileObj.social.instagram = instagram;
        if (whatsapp) profileObj.social.whatsapp = whatsapp;

        //Update to db
        profile=await Profile.findOneAndUpdate({user:request.user.id},{
            $set:profileObj
        },{new:true});
        response.status(200).json({
            msg:'Profile is Updated Successfully',
            profile:profile
        })
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors:[{msg:error.message}]});
    }
});

/*
    Usage :Get Profile of users
    Url : /api/profiles/users/:userId
    Fields : No-fields
    Method : Get
    Access : Public
 */

router.get('/users/:userId' , async (request , response) => {
    try {
        let userId = request.params.userId;
        let profile = await Profile.findOne({user : userId}).populate('user' , ['name' , 'avatar']);
        if(!profile){
            return response.status(400).json({errors : [{msg : 'No Profile Found for this users'}]});
        }
        response.status(200).json({profile : profile});
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});



/*
    Usage :Delete Profile,UserInfo,Post of users
    Url : /api/profiles/users/:userId
    Fields : No-fields
    Method : Delete
    Access : Private
 */

router.delete('/users/:userId',authenticate,async (request,response)=>{
    try {
        let userId = request.params.userId;
        let profile = await Profile.findOne({user:userId});
        if(!profile){
            return response.status(400).json({errors : [{msg : 'No Profile Found for this users'}]});
        }
        //delete the profile
        profile = await Profile.findOneAndRemove({user : userId});
        // check if users exists
        let user = await User.findOne({_id : userId});
        if(!user){
            return response.status(400).json({errors : [{msg : 'No User Found'}]});
        }
        await User.findOneAndRemove({user : userId});
        // TODO delete the post of users
        response.status(200).json({msg:'Account is deleted'})

    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    Usage :Add Education of Profile
    Url : /api/profiles/education
    Fields : school,degree,filedOfStudy,from,to,current,description
    Method : Put
    Access : Private
 */

router.put('/education',[
    body('school').notEmpty().withMessage('School is Required'),
    body('degree').notEmpty().withMessage('Degree is Required'),
    body('filedOfStudy').notEmpty().withMessage('FiledOfStudy is Required'),
    body('from').notEmpty().withMessage('From is Required'),
    body('description').notEmpty().withMessage('Description is Required'),
],authenticate,async (request,response)=>{
    let errors = validationResult(request);
    if (!errors.isEmpty()){
        return response.status(401).json({errors:errors.array()});
    }
    try {
        let {school,degree,filedOfStudy,from,to,current,description} = request.body;
        let newEducation = {
            school:school,
            degree:degree,
            filedOfStudy:filedOfStudy,
            from:from,
            to:to ? to:'',
            current:current ? current : false,
            description:description
        };

        //cheak profile is exist or not
        let profile = await Profile.findOne({user:request.user.id});
        if (!profile){
            return response.status(400).json({errors:[{msg:'No Profile Found'}]});
        }
        profile.education.unshift(newEducation);
        profile=await profile.save();
        response.status(200).json({profile:profile});
        
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    Usage :Delete Education of Profile
    Url : /api/profiles/education/:eduId
    Fields : no-field
    Method : Delete
    Access : Private
 */
router.delete('/education/:eduId',authenticate,async (request,response)=>{
    try {
        let educationId = request.params.eduId;

        //cheak profile is exist or not
        let profile= await Profile.findOne({user:request.user.id});
        if (!profile){
            return response.status(400).json({errors:[{msg:'No Profile Found'}]});
        }
        let removableindex = profile.education.map(edu=>edu._id).indexOf(educationId);
        if (removableindex !== -1){
            profile.education.splice(removableindex,1);
            profile=await profile.save();
            response.status(200).json({
                msg:'Education is deleted',
                profile:profile
            });
        }
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    Usage :Get all Profile
    Url : /api/profiles/all
    Fields : no-field
    Method : Get
    Access : Public
 */
router.get('/all',async (request,response) =>{
   try {
       let profiles = await Profile.find().populate('user',['name','avatar','email']);
       if (!profiles){
           return response.status(400).json({errors:[{msg:'No Profile Found'}]})
       }
       response.status(200).json({profiles:profiles});
   }
   catch (error) {
       console.error(error);
       response.status(500).json({errors : [{msg : error.message}]});
   }
});

/*
    @usage : GET Profile of a user with Profile Id
    @url : /api/profiles/:profileId
    @fields : no-fields
    @method : GET
    @access : PUBLIC
 */
router.get('/:profileId' , async (request , response) => {
    try {
        let profileId = request.params.profileId;
        let profile = await Profile.findById(profileId).populate('user' , ['name' , 'avatar']);
        if(!profile){
            return response.status(400).json({errors : [{msg : 'No Profile Found for this user'}]});
        }
        response.status(200).json({profile : profile});
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});



module.exports = router;