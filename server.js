const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const port = 5000;

//MongoDB Options
const db = require('./config/keys').MongoURI;
const option = {
	useNewUrlParser: true,
};

const apiRoutes = require('./routes/api.routes');
const userRoutes = require('./routes/user.routes');

//Connect to Database
mongoose.connect(db, option).then(() => console.log('MongoDb Connected...')).catch((err) => console.log(err));

app.use(cors());
app.use(bodyParser.json());

app.use('/main/api', apiRoutes);
app.use('/users/api', userRoutes);

app.get('*', (req, res) => {
	res.json({ msg: 'Hello Here, how may I help you?' });
});

app.listen(port, () => {
	console.log(`Server is booming on port 5000
Visit http://localhost:5000`);
});
