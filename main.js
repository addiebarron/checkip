import { readFile, writeFile } from 'fs/promises';

import getIP from 'public-ip'

import {
	twitterKeys as config,
	savedIPLocation as ipfile,
	twitterHandle as handle
} from './config'

import { log } from './util'

// run

export async function run () {
	let currentIP, savedIP;

	try { 
		currentIP = await getIP.v4();

		try {
			savedIP = await readSavedIP();

		} catch (err) {
			log`No saved IP found. Saving current IP (${currentIP}) to ${ipfile}`;

			savedIP = await save(currentIP);

		} finally { // tweet if there's a mismatch

			if (savedIP !== currentIP) {
				log`IP address has changed since last run. Notifying and updating saved IP...`;

				Promise
					.all([
						save(currentIP),
						tweet(savedIP, currentIP),
					])
					.then(a => log`Done!`)
					.catch(console.error);
			}
		}

	} catch (err) {
		log`Error getting public IP:`;
		log`${err}`
	}
}
// read saved ip

async function readSavedIP () {
	const data = await readFile(ipfile, 'utf-8');
	return data.trim();
}

// save a given ip

async function save (ip) {
	await writeFile(ipfile, ip, 'utf-8');
	return ip;
}

// tweet if ip has changed

import Twitter from 'twitter-lite'

async function tweet (oldIP, newIP) {
	const twitter = new Twitter(config);
	const tweetText = `our router's public ip address has changed from ${oldIP} to:\n\n${newIP}\n\ntime to update dns!`;

	return await twitter.post('statuses/update', {
		status: tweetText,
	});
}