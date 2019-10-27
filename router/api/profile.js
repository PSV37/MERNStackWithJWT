const express = require('express')
const router =  express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check , validationResult } = require('express-validator/check')


// @Route GET api/profiles/me
// @desc Get Auth Profile
// @access private
router.get('/me',auth,  async (req, res) => {
	try{
		const profile = await Profile.findOne({user:req.user.id}).populate('user', ['name', 'avatar', 'email']);

		if(!profile) {
			return res.status(401).json({msg:'There is no profile for this user'});
		} //End if


		return rees.status(200).json({profile});

	} catch(err) {
		console.log(err.messge)

		res.status(500).json({msg:'SERVER ERROR'});
	}
})

// @Route GET api/profiles/create
// @desc Create Profile
// @access private
router.post('/create', [ auth, [
		check('status', 'Status is required').not().isEmpty(),
		check('skills', 'Skills is not required').not().isEmpty()
	]], async (req, res) => {

		const errors = validationResult(req);
		if(!errors.isEmpty()) {
			return res.status(401).json({ errors:errors.array() })
		} //End if

		// Destruct request fields
		const {
    	  company,
	      website,
	      location,
	      bio,
	      status,
	      githubusername,
	      skills,
	      youtube,
	      facebook,
	      twitter,
	      instagram,
	      linkedin
		} = req.body;

		const profileFields = {};
		profileFields.user = req.user.id
		if(company) profileFields.company = company;
		if(website) profileFields.website = website;
		if(bio) profileFields.bio = bio;
		if(status) profileFields.status = status;
		if(githubusername) profileFields.githubusername = githubusername;
		if(skills){
			profileFields.skills = skills.split(',').map(skill => skill.trim())
		}

		// Build social data
		profileFields.social={};
		if (youtube) profileFields.social.youtube = youtube;
		if (twitter) profileFields.social.twitter = twitter;
		if (facebook) profileFields.social.facebook = facebook;
		if (linkedin) profileFields.social.linkedin = linkedin;
		if (instagram) profileFields.social.instagram = instagram;

		try{
			const profile = await Profile.findOne({user:req.user.id});

			if(profile) {
				// Update existing profile
				const profile = await Profile.findOneAndUpdate(
									{ user:req.user.id },
									{ $set: profileFields},
									{ new : true }
								)	

				return res.status(200).json({profile})
			} else {
				// Create new profile

				const profile = new Profile(profileFields)

				await profile.save();

				res.status(200).json({profile})
			}
		} catch(err) {
			console.log(err.messge);
			res.status(500).json({msg:'SERVER ERROR'})
		}

		//console.log(profileFields.skills)
		//res.status(200).json({msg:'success response'})
});


// @Route GET api/profiles
// @desc Get Profile
// @access private
router.get('/', auth, async (req, res) => {
	try{
		const profiles = await Profile.find().populate('user', ['name', 'email', 'avatar']);

		res.status(200).json(profiles)
	} catch(err) {
		console.log(err.message);

		res.status(500).json({msg:'SERVER ERROR'})
	}
})

// @Route GET api/profiles/user:user_id
// @desc Get Profile by user id
// @access private
router.get('/user/:user_id', auth, async (req, res) => {
	try{
		const profile = await Profile.findOne({user:req.params.user_id}).populate('user', ['name', 'email', 'avatar']);
		if(!profile) {
			return res.status(401).json({msg:'There is no profile for this user'});
			
		}
		res.status(200).json(profile)
	} catch(err) {
		console.log(err.message);
		if(err.kind=='ObjectId') {
			return res.status(401).json({msg:'Profile not found'});
		}
		res.status(500).json({msg:'SERVER ERROR'})
	}
});

// @Route GET api/profiles/delete
// @desc Delete Profile user
// @access private
router.delete('/delete', auth, async(req, res) => {
	try{
		// Remove profile from db
		await Profile.findOneAndRemove({ user:req.user.id });

		// Remove User from DB
		await User.findOneAndRemove({ _id : req.user.id });

		res.status(200).json({msg:'Auth User Profile Deleted Successfully'});
	} catch(err) {
		console.log(err.message);
		res.status(500).json({msg:'SERVER ERROR'})
	}
});



// @Route POST api/profiles/expirence
// @desc Create Profile Expirence
// @access private
router.post('/expirence', [auth, [
			check('title', 'Title is required').not().isEmpty(),
			check('company', 'Company is required').not().isEmpty(),
			check('from', 'From is require').not().isEmpty()
	]], async(req, res) => {

		// validate request params
		const errors = validationResult(req);
		if(!errors.isEmpty()) {
			return res.status(401).json({ errors: errors.array() })
		} //End if

		// Desctruct req params
		const {
			title,
			company,
			from,
			to,
			description,
			current
		} = req.body;

		// Create object for save expirence 
		const newExp = {
			title,
			company,
			from,
			to,
			description,
			current
		};

		try{
			const profile = await Profile.findOne({user:req.user.id});

			// Expirence in profile
			profile.expirence.unshift(newExp);

			// save profile model with expirence
			await profile.save();

			res.status(200).json({profile});
		} catch(err) {
			console.log(err.message)
			res.status(500).json({msg:'SERVER ERROR'})
		} //End Try-Catch
});


// @Route DELETE api/profiles/expirence/:exp_id
// @desc Delete Profile Expirence
// @access private
router.delete('/expirence/:exp_id', auth, async (req, res) => {
	try {
		// Find Profile by id
		const profile = await Profile.findOne({user:req.user.id});

		// Get remove index
		const removeIndex = profile.expirence.map(item => item.id).indexOf(req.params.exp_id);

		// remove from profile
		profile.expirence.splice(removeIndex);

		// Save profile model
		await profile.save();

		res.status(200).json({profile})
	} catch(err) {
		console.log(err.message)
		res.status(500).json({msg:'SERVER ERROR'})
	} //End Try-Catch
})


// @Route DELETE api/profiles/expirence/:exp_id
// @desc Delete Profile Expirence
// @access private
router.post('/education', [auth, [
		check('school', 'School is required').not().isEmpty(),
		check('degree', 'Degree is required').not().isEmpty(),
		check('fieldofstudy' , 'Field Of Study is required').not().isEmpty(),
		check('from', 'From is require').not().isEmpty()
	]], async(req, res) => {
		// Validate request params
		const errors = validationResult(req);
		if(!errors.isEmpty()) {
			return res.status(401).json({ errors: errors.array() });
		} //End if

		// Destruct reqest params
		const {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			description,
			current
		} = req.body;


		try{
			// Get object for save profile education
			const newEdu = {
				school,
				degree,
				fieldofstudy,
				from,
				to,
				description,
				current
			}

			// Find profile
			const profile = await Profile.findOne({user:req.user.id});

			// Add ducation in expirnce
			profile.education.unshift(newEdu);

			await profile.save();

			res.status(200).json({profile});
		} catch(err) {
			console.log(err.message);
			res.status(500).json({msg:'SERVER ERROR'});
		} //End Try-Catch
	});


// @Route DELETE api/profiles/expirence/:exp_id
// @desc Delete Profile Expirence
// @access private
router.delete('/education/:edu_id', auth,async (req, res) => {
	try{
		// Find profile
		const profile = await Profile.findOne({user:req.user.id});

		// Get remove Index
		const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

		// Remove from profile
		profile.education.splice(removeIndex);

		// Save profile
		await profile.save();

		res.status(200).json({profile})
	} catch(err) {
		console.log(err.message);
		res.status(500).json({msg:'SERVER ERROR'})
	}
})
module.exports = router;