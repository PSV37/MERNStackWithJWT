const mongoose = require('mongoose')
const config = require('config')

const db = config.get('mongoURL')

const connectDB = async () => {
	try{
		mongoose.connect(db, {
			useNewUrlParser:true,
			createIndexes:true,
			useUnifiedTopology: true
		})

		console.log('mongoDB connected...')
	}catch(err) {
		console.log(err.message)

		// Exit process with failure
		process.exit(1);
	}
}


module.exports = connectDB;