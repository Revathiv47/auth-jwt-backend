const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const PORT = process.env.PORT | 1337

app.use(cors())
app.use(express.json())


//const url = "mongodb+srv://admin:<Riya4798>@jwt.osp3y.mongodb.net/jwt?retryWrites=true&w=majority";

mongoose.connect('mongodb://localhost:27017/full-mern-stack')
const db = mongoose.connection;

db.once('open', () => {
    console.log("DB connected");
})

app.post('/register', async (req, res) => {
	console.log(req.body)
	try {
		// Connect the Database
        let client = await mongoClient.connect(url)

        // Select the DB
        let db = client.db("jwt");


		const newPassword = await bcrypt.hash(req.body.password, 10)
		await User.create({
			name: req.body.name,
			email: req.body.email,
			password: newPassword,
	
		})
		res.json({ status: 'ok' })
		
        // Close the Connection
        await client.close();
	} catch (err) {
		res.json({ status: 'error', error: 'Duplicate email' })
	}
})



app.post('/login', async (req, res) => {
	// Connect the Database
	let client = await mongoClient.connect(url)

	// Select the DB
	let db = client.db("jwt");

	

	const user = await User.findOne({
		email: req.body.email,
	})

	if (!user) {
		return { status: 'error', error: 'Invalid login' }
	}

	const isPasswordValid = await bcrypt.compare(
		req.body.password,
		user.password
	)

	if (isPasswordValid) {
		const token = jwt.sign(
			{
				name: user.name,
				email: user.email,
			},
			'secret123'
		)

		return res.json({ status: 'ok', user: token })
	} else {
		return res.json({ status: 'error', user: false })
	}
})

app.get('/api/quote', async (req, res) => {
	const token = req.headers['x-access-token']

	try {
		const decoded = jwt.verify(token, 'secret123')
		const email = decoded.email
		const user = await User.findOne({ email: email })

		return res.json({ status: 'ok', quote: user.quote })
	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'invalid token' })
	}
})

app.post('/api/quote', async (req, res) => {
	const token = req.headers['x-access-token']

	try {
		const decoded = jwt.verify(token, 'secret123')
		const email = decoded.email
		await User.updateOne(
			{ email: email },
			{ $set: { quote: req.body.quote } }
		)

		return res.json({ status: 'ok' })
	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'invalid token' })
	}
})

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`)
})
