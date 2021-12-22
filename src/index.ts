import { Router } from 'worktop';
import * as CORS from 'worktop/cors';
import * as Cache from 'worktop/cache';
import * as Todos from './routes/todos';
import * as Docs from './routes/docs';

const API = new Router();

API.prepare = CORS.preflight({
	maxage: 3600
});

API.add('GET', '/todos/:guestid', Todos.list);
API.add('POST', '/todos/:guestid', Todos.create);
API.add('PATCH', '/todos/:guestid/:uid', Todos.update);
API.add('DELETE', '/todos/:guestid/:uid', Todos.destroy);

API.add('GET', '/docs/:project/:type', Docs.list);
API.add('GET', '/docs/:project/:type/:slug', Docs.entry);

Cache.listen(API.run);
