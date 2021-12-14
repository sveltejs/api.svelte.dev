import { Router } from 'worktop';
import * as CORS from 'worktop/cors';
import * as Cache from 'worktop/cache';
import * as Todos from './routes/todos';
import * as Docs from './routes/docs';

const API = new Router();

API.prepare = CORS.preflight({
	maxage: 3600
});

API.add('GET', '/todos/:userid', Todos.list);
API.add('POST', '/todos/:userid', Todos.create);
API.add('PATCH', '/todos/:userid/:todoid', Todos.update);
API.add('DELETE', '/todos/:userid/:todoid', Todos.destroy);

API.add('GET', '/docs/:project/:type', Docs.list);
API.add('GET', '/docs/:project/:type/:slug', Docs.entry);

Cache.listen(API.run);
