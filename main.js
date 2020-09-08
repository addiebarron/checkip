import { readFile, writeFile } from 'fs/promises';

import config from './config'

// run

import util from 'util'
import cp from 'child_process'
const exec = util.promisify(cp.exec);

export async function run () {
	try {
		const currentIP = (await exec(`wget -q -O - checkip.dyndns.com`)).stdout
			.replace(/.+(IP Address: )([\d\.]+).+/, '$2')
			.trim();

		const savedIP = (await readFile(config.savedIPLocation, 'utf-8')).trim();

		if (savedIP !== currentIP) {
			update(currentIP);
			tweet(savedIP, currentIP);
		} else {
			console.log('IP Address has not changed.')
		}
	} catch (err) {
		console.error(err);
	}
}

// tweet if IP has changed

import Twitter from 'twitter-lite'

async function tweet (oldIP, newIP) {
	const twitter = new Twitter(config.twitter);
	const tweetText = `@${config.twitterHandle} our router's public ip address has changed from ${oldIP} to ${newIP}. time to update dns!!`;

	try {
		await twitter.post('statuses/update', {
			status: tweetText,
		});
	} catch (err) {
		console.log(err);
	}
}

// update saved IP to match current one, if necessary

async function update (newIP) {
	await writeFile(config.savedIPLocation, newIP, 'utf-8');
}