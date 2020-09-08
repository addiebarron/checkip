import { readFile, writeFile } from 'fs/promises';

import {
	config,
	ipfile,
	handle
} from './config'

// run

import util from 'util'
import cp from 'child_process'
const exec = util.promisify(cp.exec);

export async function run () {
	

	let currentIP, savedIP;

	try {
		currentIP = ( await exec(`wget -q -O - checkip.dyndns.com`) )
			.stdout
			.replace(/.+(IP Address: )([\d\.]+).+/, '$2')
			.trim();

	} catch (err) {
		console.log(err)
	}

	try {
		savedIP = ( await readFile(ipfile, 'utf-8') ).trim()

		if (savedIP !== currentIP) {
			save(currentIP);
			tweet(savedIP, currentIP);
		} else {
			console.log('IP Address has not changed.')
		}
	} catch (err) {

		await writeFile(ipfile, currentIP, 'utf-8');

		console.log(`No saved IP found. Saved current IP (${currentIP}) to ${ipfile}`);
	}
}

// tweet if IP has changed

import Twitter from 'twitter-lite'

async function tweet (oldIP, newIP) {
	const twitter = new Twitter(config.twitter);
	const tweetText = `our router's public ip address has changed from ${oldIP} to:

${newIP}

time to update dns!`;

	try {
		await twitter.post('statuses/update', {
			status: tweetText,
		});
	} catch (err) {
		console.log(err);
	}
}

// replace saved IP with current one

async function save (newIP) {
	await writeFile(ipfile, newIP, 'utf-8');
}