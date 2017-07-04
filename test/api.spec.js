import test from 'ava';
import request from 'supertest';
import app from '../api';
import * as is from 'is_js';
import { default as swagger } from '../api/swagger/util';
import * as _ from 'lodash';

const HOST = 'http://localhost:' || process.env.HOST;
const PORT = 3000 || process.env.PORT;

test.before(async() => {
    await swagger.init(app);
    await app.listen(PORT);
});

test('/GET healthcheck', async(t) => {

	const r = await request(HOST + PORT)
		.get('/healthcheck')
		.expect(200);

	t.true(r.body.uptime !== undefined);
});

test('/GET calculateTax 200', async(t) => {
	t.plan(2);

	const r = await request(HOST + PORT)
		.get('/calculateTax?income=200000')
        .set('api_key', '1234')
		.expect(200);


	t.true(is.object(r.body), 'Result should be an object');
	t.true(_.isEqual(r.body, require('./mock/taxResponse.json')), 'Tax calculation result conforms to sample calculation in mock data');
});

test('/GET calculateTax 401', async(t) => {
    const r = await request(HOST + PORT)
        .get('/calculateTax?income=200000')
        .expect(401);

    t.true(r.statusCode === 401)
});