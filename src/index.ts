import { Router } from 'worktop';
import * as CORS from 'worktop/cors';
import * as Cache from 'worktop/cache';
import * as Gists from './routes/gists';
import * as Sessions from './routes/sessions';
import * as Todos from './routes/todos';
import * as Docs from './routes/docs';

const API = new Router();

API.prepare = CORS.preflight({
	maxage: 3600
});

API.add('POST', '/session', Sessions.create);
API.add('GET', '/session/:sessionid', Sessions.show);
API.add('DELETE', '/session/:sessionid', Sessions.destroy);

API.add('GET', '/gists', Gists.list);
API.add('POST', '/gists', Gists.create);
API.add('GET', '/gists/:gistid', Gists.show);
API.add('PUT', '/gists/:gistid', Gists.update);
API.add('DELETE', '/gists/:gistid', Gists.destroy);

API.add('GET', '/todos/:guestid', Todos.list);
API.add('POST', '/todos/:guestid', Todos.create);
API.add('PATCH', '/todos/:guestid/:todoid', Todos.update);
API.add('DELETE', '/todos/:guestid/:todoid', Todos.destroy);

API.add('GET', '/docs/:project/:type', Docs.list);
API.add('GET', '/docs/:project/:type/:slug', Docs.entry);

Cache.listen(API.run);
