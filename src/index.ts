import { Router } from 'worktop';
import * as CORS from 'worktop/cors';
import * as Cache from 'worktop/cache';
import * as Gists from './routes/gists';
import * as Todos from './routes/todos';
import * as Auth from './routes/auth';
import * as Docs from './routes/docs';

const API = new Router();

API.prepare = CORS.preflight();

API.add('GET', '/auth/login', Auth.login);
API.add('GET', '/auth/callback', Auth.callback);
API.add('GET', '/auth/logout', Auth.logout);

API.add('GET', '/gists', Gists.list);
API.add('POST', '/gists', Gists.create);
API.add('GET', '/gists/:uid', Gists.show);
API.add('PUT', '/gists/:uid', Gists.update);
API.add('DELETE', '/gists/:uid', Gists.destroy);

API.add('GET', '/todos/:userid', Todos.list);
API.add('POST', '/todos/:userid', Todos.create);
API.add('PATCH', '/todos/:userid/:uid', Todos.update);
API.add('DELETE', '/todos/:userid/:uid', Todos.destroy);

API.add('GET', '/docs/:project/:type', Docs.list);
API.add('GET', '/docs/:project/:type/:slug', Docs.entry);

Cache.listen(API.run);
