const express = require('express');
const router = express.Router();
const {body,validationResult} = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticate = require('../middlewares/authenticate');

/*
    Usage : Register User
    Url : /api/users/register
    Fields : name,email,password
    Method : POST
    Access : Public
 */
router.post('/register',[
    body('name').notEmpty().withMessage('Name is Required'),
    body('email').notEmpty().withMessage('Email is Required'),
    body('password').notEmpty().withMessage('Password is Required'),
],async (request,response)=>{
    let errors = validationResult(request);
    if (!errors.isEmpty()){
        return response.status(400).json({errors:errors.array()})
    }
    try{
        let {name,email,password} = request.body;
        //check users is exist or not
        let user = await User.findOne({email:email});
        if (user){
            return response.status(401).json({errors:[{msg:'User is alredy Exists'}]});
        }

        //encode the password
        let salt = await bcrypt.genSalt(10);
        password= await bcrypt.hash(password,salt);

        //get gravatar url
        let avatar = gravatar.url(email,{
            s:'300',
            r:'pg',
            d:'mm'
        });

        //insert users into database
        user = new User({name,email,password,avatar});
        await user.save();
        response.status(200).json({msg:'registration is Success'})
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors:[{msg:error.message}]});
    }
});

/*
    Usage : Login User
    Url : /api/users/login
    Fields : email,password
    Method : POST
    Access : Public
 */
router.post('/login',[
    body('email').notEmpty().withMessage('Email is Required'),
    body('password').notEmpty().withMessage('Password is Required'),
],async (request,response)=>{
    let errors = validationResult(request);
    if (!errors.isEmpty()){
        return response.status(400).json({errors:errors.array()})
    }
    try {
        let {email,password} = request.body;

        //cheack if correct email
        let user = await User.findOne({email:email});
        if (!user){
            return response.status(401).json({errors:[{msg:'Invalid Email'}]});
        }

        //cheak password
        let isMatch = await bcrypt.compare(password,user.password);
        if (!isMatch){
            return response.status(401).json({errors:[{msg:'Invalid Password'}]});
        }

        //crate token and send to client
        let payload ={
            user:{
                id:user.id,
                name:user.name
            }
        };
        jwt.sign(payload,process.env.JWT_SECRET_KEY,(error,token)=>{
            if(error) throw error;
            response.status(200).json({
                msg:'Login Success',
                token:token
            })
        })
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors:[{msg:error.message}]});
    }
});

/*
    Usage :to Get User Info
    Url : /api/users/
    Fields : no fields
    Method : POST
    Access : Public
 */
router.get('/me',authenticate,async (request,response)=>{
    try {
        let user = await User.findById(request.user.id).select('-password');
        response.status(200).json({
            user:user
        })
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors:[{msg:error.message}]});

    }
});

module.exports = router;