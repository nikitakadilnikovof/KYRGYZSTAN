import path from 'node:path';
import {settings} from './content.mjs';

const requestedPath=(process.env.SITE_BASE_PATH??'').replace(/^\/+|\/+$/g,'');
if(requestedPath&&!requestedPath.split('/').every(p=>/^[A-Za-z0-9_-]+$/.test(p)))throw Error('Invalid SITE_BASE_PATH');
export const basePath=requestedPath?'/'+requestedPath:'';
const origin=new URL(process.env.SITE_ORIGIN??settings.origin);
if(!['http:','https:'].includes(origin.protocol)||origin.pathname!=='/'||origin.search||origin.hash)throw Error('SITE_ORIGIN must be an HTTP origin without a path');
export const siteRoot=origin.origin+basePath;
export const outputDir=path.resolve(process.env.SITE_OUTPUT_DIR??'dist');
export const sitePath=url=>url.startsWith('/')&&!url.startsWith('//')?basePath+url:url;
