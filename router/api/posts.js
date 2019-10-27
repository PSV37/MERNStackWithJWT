const express = require('express')
const router =  express.Router();
const auth = require('../../middleware/auth');
const { check , validationResult } = require('express-validator/check')
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');


// @Route POST api/post/create
// @desc Create Post
// @access private
router.post('/create', [auth, [
		check('text', 'Text Field is required').not().isEmpty(),
	]], async (req, res) => {

		// Check validation
		const errors = validationResult(req);
		if(!errors.isEmpty()) {
			return res.status(401).json({ errors: errors.array() })
		} //End if

		try{
			// Find user by id
			const user = await User.findById(req.user.id).select('-password');

			// Create Post
			const newPost = new Post({
				text : req.body.text,
				name : user.name,
				avatar : user.avatar,
				user : req.user.id
			});

			await newPost.save();

			res.status(200).json(newPost);

		} catch(err) {
			console.log(err.message)
			res.status(500).json({msg:'SERVER ERROR'})
		} //End Try-catch
})


// @Route POST api/post/create
// @desc Create Post
// @access private
router.get('/all', auth, async (req, res) => {
	try{
		// Get all posts
		const posts = await Post.find().sort({ date : -1 });

		res.status(200).json(posts);
	} catch(err) {
		console.log(err.message)
		res.status(500).json({msg:'SERVER ERROR'})
	} //End Try-catch
});

// @Route POST api/post/:post_id
// @desc Get Post By Id
// @access private
router.get('/:post_id', auth, async (req, res) => {
	try{
		// Get all posts
		const post = await Post.findById(req.params.post_id);

		if(!post) {
			return res.status(401).json({ msg: 'Post Not Found'})
		}
		res.status(200).json(post);
	} catch(err) {
		console.log(err.message)
		if(err.kind === 'ObjectId') {
			return res.status(401).json({ msg: 'Post Not Found'})
		} //End if
		res.status(500).json({msg:'SERVER ERROR'})
	} //End Try-catch
})

// @Route DELETE api/post/:post_id
// @desc Delete Post By Id
// @access private
router.delete('/:post_id', auth, async (req, res) => {
	try{
		// Get all posts
		const post = await Post.findById(req.params.post_id);

		if(!post) {
			return res.status(401).json({ msg: 'Post Not Found'})
		} //End if

		if(post.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User Not Authorized'})
		} //End if

		await post.remove();

		res.status(200).json({msg : 'Post Removed'});
	} catch(err) {
		console.log(err.message)
		if(err.kind === 'ObjectId') {
			return res.status(401).json({ msg: 'Post Not Found'})
		} //End if

		res.status(500).json({msg:'SERVER ERROR'})
	} //End Try-catch
})

// @Route PUT api/post/likes/:post_id
// @desc Likes Post By Id
// @access private
router.put('/likes/:id', auth, async (req, res) => {
	try{
		// get post by id
		const post = await Post.findById(req.params.id);

		// Check post is already like or not
		if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
			return res.status(400).json({ msg : 'Post already liked'});
		} //End if

		// Add post likes
		post.likes.unshift({user:req.user.id});

		// Save post
		await post.save();

		res.status(200).json(post.likes)
	} catch(err) {
		console.log(err.message)
		res.status(500).json({msg:'SERVER ERROR'})
	}  //End Try-catch
})


// @Route PUT api/post/unlikes/:post_id
// @desc Likes Post By Id
// @access private
router.put('/unlikes/:id', auth, async (req, res) => {
	try{
		// get post by id
		const post = await Post.findById(req.params.id);

		// Check post is already like or not
		if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
			return res.status(400).json({ msg : 'Post has not yet been liked'});
		} //End if

		// remove index
		const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)

		// remove post likes
		post.likes.splice(removeIndex, 1);

		// Save post
		await post.save();

		res.status(200).json(post.likes)
	} catch(err) {
		console.log(err.message)
		res.status(500).json({msg:'SERVER ERROR'})
	}  //End Try-catch
});


// @Route POST api/post/comments/:id
// @desc Create Post Comments
// @access private
router.post('/comments/:id', [auth, [
		check('text', 'Text Field is required').not().isEmpty(),
	]], async (req, res) => {

		// Check validation
		const errors = validationResult(req);
		if(!errors.isEmpty()) {
			return res.status(401).json({ errors: errors.array() })
		} //End if

		try{
			// Find user by id
			const user = await User.findById(req.user.id).select('-password');
			const post = await Post.findById(req.params.id);

			// Create Post
			const newComment = new Post({
				text : req.body.text,
				name : user.name,
				avatar : user.avatar,
				user : req.user.id
			});

			post.comments.unshift(newComment);

			await post.save();

			res.status(200).json(post.comments);

		} catch(err) {
			console.log(err.message)
			res.status(500).json({msg:'SERVER ERROR'})
		} //End Try-catch
})


// @Route DELETE api/post/comments/:id/:comment_id
// @desc Delete Post Comments
// @access private
router.delete('/comments/:id/:comment_id', auth, async (req, res) => {
	try{
		const post = await Post.findById(req.params.id);

		// Pull out comment
		const comment = post.comments.find(comment => comment.id === req.params.comment_id);

		if(!comment) {
			return res.status(400).json({ msg : 'Comment dose not exists' })
		} //End if

		if(comment.user.toString() !== req.user.id) {
			return res.status(400).json({ msg:'User Not Authorized' })
		} //End if

		// Remove index
		const removeIndex = post.comments.map(comm => comm.user.toString()).indexOf(req.user.id);

		post.comments.splice(removeIndex, 1);

		await post.save();

		res.status(200).json(post.comments);

	} catch(err) {
		console.log(err.message)
		res.status(500).json({msg:'SERVER ERROR'})
	} //End Try-catch
})












module.exports = router;