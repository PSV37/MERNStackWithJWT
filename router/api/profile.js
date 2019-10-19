const express = require('express')
const router =  express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
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
})

module.exports = router;