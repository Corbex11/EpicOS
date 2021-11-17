/* callum fisher - corbex11@gmail.com
last updated: 17/11/2021 */

const editJsonFile = require("edit-json-file");
const fs = require("fs");

const module_prefix = "[LAUNCHER]";

console.log(`${module_prefix} Running.`);

const conKeys = {
	"configReady": false,
	"firstTimeRun": true,
	"quietLogging": true,
	"language": "english",
	"cmdprefix": "?",
	"welcomeNewUsers": false,
	"welcomeRegisteredUsers": true,
	"welcomeUnregisteredUsers": true,
	"onlyWelcomeIfChannelOwner": true,
	"recordChatLogs": true,
	"sendAutomaticResponses": true,
	"banUsersFromChannelIfBannedFromBot": true,
	"ownerNickname": "sublimehawk6",
	"servers": {
		"wss://multiplayerpiano.com":[
			"EpicOS"
		]
	},
	"defaultName": "Anonymous"
}

const dirs = [
	"language",
	"log",
	"imidi",
	"midi",
	"db"
];

dirs.forEach(dir => { // Create missing directories:
    if (!fs.existsSync("./"+dir)) {
		fs.mkdirSync("./"+dir);
		console.log(`${module_prefix} Made missing directory: "${dir}"`);
	}
});

const config = editJsonFile("./config.json");

if (config.data.firstTimeRun == undefined) {
    config.set("firstTimeRun", true);
} else if (config.data.firstTimeRun) {
    config.set("firstTimeRun", false);
}

Object.keys(conKeys).forEach(key => { // Check the keys currently in the configuration file for missing keys and add those missing keys:
	if (!Object.keys(config.data).includes(key)) {
		if (!config.data.quietLogging) console.log(`${module_prefix} [configuration] > Adding missing key "${key}" with value: ${JSON.stringify(conKeys[key])}`);
		config.set(key, conKeys[key]);
	}
});

Object.keys(config.data).forEach(key => { // Check the keys currently in the configuration file for unknown keys and remove those unknown keys:
	if (!Object.keys(conKeys).includes(key)) {
		if (!config.data.quietLogging) console.log(`${module_prefix} [configuration] > Removing unknown key "${key}"`);
		delete config.data[key];
	}
});

if (!config.data.quietLogging) console.log(`${module_prefix} [configuration] >> Using the following options:`);

Object.keys(config.data).forEach(key => { // Print out the key values being used:
	if (!config.data.quietLogging) console.log(`${module_prefix} [configuration] - ${key}: ${JSON.stringify(config.data[key])}`);
});

config.save();

if (!config.data.configReady) {
	console.log(`${module_prefix} Please fill in your configuration file (config.json) and change "configReady" to "true".`);
	process.exit();
}

const log = require("./log.js");

if (!fs.existsSync("./language/"+config.data.language+".json")) {
	log.add(`${module_prefix} [localization] >> Language file "${config.data.language}.json" not found`);
	lang = {};
} else {
	log.add(`${module_prefix} [localization] >> Found localization file "${config.data.language}.json"`);
	lang = require("./language/"+config.data.language+".json");
}

log.add(`${module_prefix} ${config.data.firstTimeRun ? lang.newuser || "Welcome!" : lang.olduser || "Welcome back." }`);
log.add(`${module_prefix} ${lang.startapp || "Starting application.."}`);

require("./app.js");