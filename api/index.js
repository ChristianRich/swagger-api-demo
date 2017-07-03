import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';

const app = express();
app.server = http.createServer(app);

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

/**
 * body-parser breaks when posting invalid JSON - this middleware catched the error
 */
app.use(function (error, req, res, next) {
	if(error instanceof SyntaxError && req.method === 'POST') {
		return res.status(400).json({
			error: 'Error parsing JSON'
		})
	}
	next();
});

// Redirect baseurl to Swagger UI
app.get('/', (req, res) => {
	res.redirect('/docs/#/default');
});

export default app;
