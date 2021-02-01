import { Router } from 'worktop';

const API = new Router();

API.add('GET', '/test', (req, res) => {
	res.send(200, 'hello');
});

addEventListener('fetch', API.listen);
