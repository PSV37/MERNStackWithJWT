const express = require('express')
const router =  express.Router();
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator/check');
const jwt = require('jsonwebtoken')
const config = require('config')
const jwtSecret = config.get('jwtSecret')


// @Route GET api/auth
// @desc Get Auth data
// @access public
router.get('/', auth, async (req, res) => {
	try{
		console.log(req.user)
		const user = await User.findById(req.user.id).select('-password');
		res.json({user})
		//res.send('auth api ddddfire')
	} catch(err) {
		console.log(err.message)
		res.status(500).send({ msg : 'Server error' })
	}
})


// @Route POST api/auth/login
// @desc Login User
// @access public
router.post('/login', 
	[
		// Check request validation
		check('email', 'Email is required and check a valid email').isEmail(),
		check('password', 'Passwordm is required').exists()
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
			const { email, password } = req.body

			// Check and find user exists or not
			const user = await User.findOne({email})
			if(!user) {
				res.status(400).json({ errors : [{ msg:'Invalid Credentials' }]})
			} //End if

			const isMatch = await bcrypt.compare(password, user.password)
			if(!isMatch) {
				return res.status(401).json({ msg:'Invalid Credentials' })
			} //End if

			// Create payload for check jwt
			const payload = {
				user:{
					id:user.id
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


module.exports = router;