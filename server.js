const express = require('express')
const connectDB = require('./config/db')
const users = require('./router/api/users')
const profiles = require('./router/api/profile')
const auth = require('./router/api/auth')
const posts = require('./router/api/posts')

const app = express()

app.use(express.json({ extended :true }));

// Connect database
connectDB();

app.get('/test', (req, res) => {
	res.send('running successfully')
})


app.use('/api/users', users);
app.use('/api/posts', posts);
app.use('/api/auth', auth);
app.use('/api/profiles', profiles);


const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
	console.log('server running on ' + PORT)
})
