import { Router } from 'worktop';
import * as Gists from './routes/gists';

const API = new Router();

API.add('GET', '/gists', Gists.list);
API.add('POST', '/gists', Gists.create);
API.add('GET', '/gists/:uid', Gists.show);
API.add('PUT', '/gists/:uid', Gists.update);
API.add('DELETE', '/gists/:uid', Gists.destroy);

addEventListener('fetch', API.listen);
