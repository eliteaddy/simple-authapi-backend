const express = require('express');
const auth = require('../config/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/keys');
const router = express.Router();

// User Model
const User = require('../model/User');

// Home route
router.get('/', auth, (req, res) => {
	User.findById(req.user.id).select('-password').then((user) => res.json(user));
});

// For Register
router.put('/', (req, res) => {
	var { name, password, email } = req.body;

	if (!name || !password || !email) {
		return res.status(400).json({
			msg: 'Enter All Field',
		});
	}

	User.findOne({
		$or: [
			{
				name,
			},
			{
				email,
			},
		],
	}).then((user) => {
		if (user) {
			if (user.name == name || user.email == email) {
				return res.status(400).json({
					mgs: 'Sorry, User Already Exist!',
				});
			}
			return res.status(400);
		}

		var newUser = new User({
			name,
			password,
			email,
		});

		// Create Salt and Hash
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(newUser.password, salt, (err, hash) => {
				if (err) throw err;
				newUser.password = hash;
				newUser.save().then((user) => {
					jwt.sign(
						{
							id: user.id,
						},
						jwtSecret,
						{
							expiresIn: 3600000000,
						},
						(err, token) => {
							if (err) throw err;
							res.json({
								token,
								user,
							});
						},
					);
				});
			});
		});
	});
});

// For Login
router.post('/', (req, res) => {
	var { email, password } = req.body;
	var logger = email;
	if (!logger || !password) {
		return res.status(400).json({
			msg: 'Enter All Field',
		});
	}
	User.findOne({
		$or: [ { email }, { name: email } ],
	}).then((user) => {
		if (!user)
			return res.status(400).json({
				mgs: "User Doesn't Exist!",
			});
		bcrypt.compare(password, user.password).then((isMatch) => {
			if (!isMatch)
				return res.status(400).json({
					msg: 'Invalid Credentials',
				});
			jwt.sign(
				{
					id: user.id,
				},
				jwtSecret,
				{
					expiresIn: 3600000000,
				},
				(err, token) => {
					if (err) throw err;
					res.json({
						token,
						user,
					});
				},
			);
		});
	});
});

router.delete('/:id', auth, (req, res) => {
	User.findByIdAndDelete(req.params.id, (err, todo) => {
		if (err)
			return res.status(500).send({
				success: false,
			});
		return res.json({
			success: true,
		});
	});
});

router.patch('/:id', (req, res) => {
	// Create Salt and Hash
	var { password } = req.body;
	var newUser = {
		password,
	};
	bcrypt.genSalt(10, (err, salt) => {
		bcrypt.hash(newUser.password, salt, (err, hash) => {
			if (err) throw err;
			newUser.password = hash;
			User.findByIdAndUpdate(
				req.params.id,
				newUser,
				{
					new: true,
				},
				(err, data) => {
					if (err) return res.status(500).send(err);
					return res.json(data);
				},
			);
		});
	});
});

module.exports = router;
