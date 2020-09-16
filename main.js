import { 
	promises as fs, 
	createWriteStream 
} from 'fs';
import getIP from 'public-ip'

import { 
	log, 
	pathify
} from './util'

import {
	twitterKeys as config,
	savedIPLocation,
	twitterHandle as handle
} from './config'

const ipfile = pathify(savedIPLocation);

// init

export async function init(argv) {

	// create necessary directories

	await Promise.all(
		['logs', 'keys',].map(
			dir => fs.mkdir(pathify(dir), { recursive: true }) // recursive also stops errors if directories exist
		)
	)

	// set console output to file if no verbose flag

	if (!argv.includes('-v')) {
		const [ logStream, errStream ] = [
			'log.out', 
			'err.out'
		].map(dir => createWriteStream(pathify(`logs/${dir}`)));

		global.console = new console.Console(logStream, errStream);
	}

	// now run the rest of it!
	
	main();
}

// main 

async function main () {
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
			} else {
				log`No change.`
			}
		}

	} catch (err) {
		log`Error getting public IP:`;
		log`${err}`
	}
}

// read saved ip

async function readSavedIP () {
	const data = await fs.readFile(ipfile, 'utf-8');
	return data.trim();
}

// save a given ip

async function save (ip) {
	await fs.writeFile(ipfile, ip, 'utf-8');
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