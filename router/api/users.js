const express = require('express');
const config = require('config')
const router =  express.Router();
const { check, validationResult } = require('express-validator/check');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const jwtSecret = config.get('jwtSecret')



// @Route POST api/users
// @desc Register User
// @access public
router.post('/', 
	[
		// Check request validation
		check('name', 'Name is required').not().isEmpty(),
		check('email', 'Email is required and check a valid email').isEmail(),
		check('password', 'Passwordm is required and must be 6 or more chars').isLength({ min : 6 })
	],
	async (req, res) => {
		// Check errors
		const errors = validationResult(req)
		if(!errors.isEmpty()) {
			// Return errors
			return res.status(400).json({ errors : errors.array() })
		} //End if

		try{
			// De-struct values from body
			const { name, email, password } = req.body

			// Check and find user exists or not
			const user = await User.findOne({email})
			if(user) {
				res.status(400).json({ errors : [{ msg:'User Already Exists' }]})
			} //End if

			// Create default image profile for devlopers
			const avatar = gravatar.url(email, {
				s:'200',
				r:'pg',
				d:'mm'
			});

			// Create user
			let users = new User({
				name,
				email,
				avatar,
				password
			});

			// bcrypt user password
			const salt = await bcrypt.genSalt(10);
			users.password = await bcrypt.hash(password, salt);

			await users.save();
			
			// Create payload for check jwt
			const payload = {
				user:{
					id:users.id
				}
			}

			//Create jwt token
			jwt.sign(
				payload, 
				jwtSecret, 
				{ expiresIn:'1h' },
				(err, token) => {
					if(err) throw err;

					res.json({payload, token})
				}
			)

			//res.send('users api fire')			
		} catch(err) {
			console.log(err)
			res.status(500).send('Server error')
		} //End Try-catch

	})


router.get('/all', async (req, res) => {
	try{
		// get all users
		const users = await User.find().select('-password');

		res.status(200).json({users})
	} catch(err) {
		console.log(err)
		res.status(401).json({msg:'ACCESS DENIED'})
	}
})
module.exports = router;