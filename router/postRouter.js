const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const Post = require('../models/Post');
const User = require('../models/User');
const {body,validationResult} = require('express-validator');

/*
    Usage :Create a Post
    Url : /api/posts
    Fields : text , image
    Method : Post
    Access : Private
 */
router.post('/',[
        body('text').notEmpty().withMessage('Text is Required'),
        body('image').notEmpty().withMessage('Image is Required'),
], authenticate,async (request,response)=>{
    let errors = validationResult(request);
    if (!errors.isEmpty()){
        return response.status(401).json({errors:errors.array()});
    }
   try {
        let user = await User.findById(request.user.id);
        let newPost ={
            user:request.user.id,
            text:request.body.text,
            image:request.body.image,
            name:user.name,
            avatar:user.avatar
        };
        //create a post
       let post =new Post(newPost);
       post = await post.save();
       response.status(200).json({post:post})
   } 
   catch (error) {
       console.error(error);
       response.status(500).json({errors : [{msg : error.message}]});
   }
});

/*
    Usage :Get All Post
    Url : /api/posts
    Fields : no-feilds
    Method : Get
    Access : Private
 */
router.get('/',authenticate,async (request,response)=>{
     try {
         let post = await Post.find();
         if (!post){
             return response.status(400).json({errors:[{msg:'No Post Found'}]})
         }
         response.status(200).json({post:post});
     }
     catch (error) {
         console.error(error);
         response.status(500).json({errors : [{msg : error.message}]});
     }
});

/*
    Usage :Get a Post With PostId
    Url : /api/posts/:postId
    Fields : no-feilds
    Method : Get
    Access : Private
 */
router.get('/:postId',authenticate,async (request,response)=>{
    try {
        let postId = request.params.postId;
        let post = await Post.findById(postId);
        if (!post){
           return response.status(400).json({errors:({msg:'No Post Found'})})
        }
        response.status(200).json({post:post});
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    Usage :Delete a Post With PostId
    Url : /api/posts/:postId
    Fields : no-feilds
    Method : Delete
    Access : Private
 */
router.delete('/:postId',authenticate,async (request,response)=>{
    try {
        let postId = request.params.postId;
        //cheak if post is exists
        let post = await Post.findById(postId);
        if (!post){
            return response.status(400).json({errors:({msg:'No Post Found'})})
        }
        post = await Post.findByIdAndRemove(postId);
        response.status(200).json({
            msg:'Post is Deleted',
            post:post
        })

    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    Usage :Like a Post With PostId
    Url : /api/posts/like/:postId
    Fields : no-feilds
    Method : Put
    Access : Private
 */
router.put('/like/:postId',authenticate,async (request,response)=>{
   try {
       //cheak the post is exist or not
       let postId = request.params.postId;
       let post = await Post.findById(postId);
       if (!post){
           return response.status(400).json({errors:({msg:'No Post Found'})})
       }
       // check if the users has already been liked
       if(post.like.filter(like => like.user.toString() === request.user.id.toString()).length > 0){
           return response.status(400).json({errors : [{msg : 'Post has already been liked'}]});
       }

       //like the post
       post.like.unshift({user:request.user.id});
       post.save();
       response.status(200).json({post:post})
   }
   catch (error) {
       console.error(error);
       response.status(500).json({errors : [{msg : error.message}]});
   }
});

/*
    Usage :Unlike a Post With PostId
    Url : /api/posts/unlike/:postId
    Fields : no-feilds
    Method : Put
    Access : Private
 */
router.put('/unlike/:postId',authenticate,async (request,response)=>{
    try {
        //cheak the post is exist or not
        let postId = request.params.postId;
        let post = await Post.findById(postId);
        if (!post){
            return response.status(400).json({errors:({msg:'No Post Found'})})
        }
        // check if the users has already been liked
        if(post.like.filter(like => like.user.toString() === request.user.id.toString()).length === 0){
            return response.status(400).json({errors : [{msg : 'Post has not been liked'}]});
        }

        //unlike the post
        let removableIndex = post.like.map(like => like.user.toString()).indexOf(request.user.id.toString());
        if (removableIndex !== -1){
            post.like.splice(removableIndex,1);
            post.save();
            response.status(200).json({post:post})
        }
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    Usage :Create Comments to post
    Url : /api/posts/comment/:postId
    Fields : text
    Method : Post
    Access : Private
 */
router.post('/comment/:postId',[
    body('text').notEmpty().withMessage('Text is Required')
],authenticate,async (request,response)=>{
    let errors = validationResult(request);
    if (!errors.isEmpty()){
        return response.status(401).json({errors:errors.array()});
    }
    try {
        let user = await User.findOne({_id:request.user.id});

        //cheak the post is exist or not
        let postId = request.params.postId;
        let post = await Post.findById(postId);
        if (!post){
            return response.status(400).json({errors:({msg:'No Post Found'})})
        }
        let newComment ={
            user:request.user.id,
            text:request.body.text,
            name:user.name,
            avatar:user.avatar
        };
        post.comments.unshift(newComment);
        post = await post.save();
        response.status(200).json({post:post});
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    Usage :Delete Comments of post
    Url : /api/posts/comment/:postId/:commentId
    Fields : no-feilds
    Method : Delete
    Access : Private
 */
router.delete('/comment/:postId/:commentId',authenticate,async (request,response)=>{
   try {
        let postId = request.params.postId;
        let commentId = request.params.commentId;
       //cheak the post is exist or not
       let post = await Post.findById(postId);
       /*if (!post){
           return response.status(400).json({errors:({msg:'No Post Found'})});
       }*/
       let comment = post.comments.find(comment => comment.id === commentId);
       //cheak if comment is exist
       if (!comment){
           return response.status(404).json({errors:({msg:'No Comment Found'})});
       }
       //cheak you made comment or not
       if (comment.user.toString() !== request.user.id){
           return response.status(401).json({errors:({msg:'User is not Authorized'})})
       }
       //delete the comment
       let removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(request.user.id);
       if (removeIndex !== -1){
           post.comments.splice(removeIndex,1);
           await post.save();
           response.status(200).json({post:post});
       }
   }
   catch (error) {
       console.error(error);
       response.status(500).json({errors : [{msg : error.message}]});
   }
});
module.exports = router;