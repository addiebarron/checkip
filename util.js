// custom template literal log function

import { promises as fs } from 'fs'
import { resolve } from 'path'
import { logLocation as logFile } from './config'

export function pathify(name) {
	return resolve(approot, name);
}

export function log (strings, ...vars) {
	const timestamp = new Date().toLocaleString();
	const text = strings
				.map( (v,i) => [v, vars[i]] )
				.reduce( (a,b) => a.concat(b) )
				.join('')

	console.log(`[${timestamp}] ${text}`);
}