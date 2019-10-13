const jwt = require('jsonwebtoken')
const config = require('config')
const secretKet = config.get('jwtSecret')

module.exports = function(req, res, next) {

	// First way to find and check token 

	// Get auth header value
	// const bearerHeader =  req.header['authorization']
	// // check bearer header id undefined
	// if(typeof bearerHeader !== 'undefined') {
	// 	const bearer = bearerHeader.split(' ');

	// 	const bearerToken = bearer[1];

	// 	req.token = bearerToken;

	// 	next();
	// } else {
	// 	// Throw Forbbiden error
	// 	res.status(401).json({ msg:'Token is not validssss' })
	// }

	// Second way to find and check token 
	//get token fro header
	const token = req.header('authorization')
	if(!token) {
		res.status(401).json({ msg: 'No Token, Authorization Denied' })
	} //End if

	try{
		// Verify token
		const decoded = jwt.verify(token, secretKet)

		req.user = decoded.user

		next();
	} catch(err) {
		res.status(401).json({ msg:'Token is not valid' })
	} //End Try-Catch
}


