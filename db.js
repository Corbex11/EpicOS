/* callum fisher - corbex11@gmail.com
last updated: 17/11/2021 */

// Dependencies ++
const fs = require("fs");
const log = require("./log.js");
const editJsonFile = require("edit-json-file");
// Dependencies --

const modulePrefix = "[DB]";

function valid_id (_id) {
	return _id.length == 24;
}

module.exports = {
	registered: function (_id) {
		return JSON.stringify(editJsonFile(`./db/${_id}.json`).data) !== "{}";
	},
	sendMessage: function (content, _id, senderId, senderName) {
		var user = editJsonFile(`./db/${_id}.json`);
		user.data.inbox.push({
			"date": Date.now(),
			"read": false,
			"told": false,
			"content": content,
			"sender": {
				"name": senderName,
				"_id": senderId
			}
		});
		user.save()
	},
	itemExists: function (item) {
		return fs.existsSync(__dirname+"/items/"+item+".js")
	},
	hasItem: function(item, _id) {
		if (!module.exports.itemExists(item)) return false;
		return Object.keys(editJsonFile(`./db/${_id}.json`).data.inventory).includes(item) && editJsonFile(`./db/${_id}.json`).data.inventory[item].amount > 0
	},
	get: function(key, _id) {
		var user = editJsonFile(`./db/${_id}.json`)
		return user.get(key)
	},
	set: function(key, value, _id) {
		var user = editJsonFile(`./db/${_id}.json`)
		user.set(key, value)
		user.save()
	},
	giveItem: function(item, _id, amount) {
		var user = editJsonFile(`./db/${_id}.json`)
		if (module.exports.hasItem(item, _id)) {
			user.data.inventory[item].amount += amount || 1
		} else {
			if (module.exports.itemExists(item)) user.data.inventory[item] = {
				amount: amount || 1
			}
		}
		user.save()
		log.add(`${modulePrefix} Gave ${amount || 1} to ${_id}`)
	},
	takeItem: function(item, _id, amount) {
		var user = editJsonFile(`./db/${_id}.json`)
		if (module.exports.hasItem(item, _id)) {
			user.data.inventory[item].amount -= amount || 1
			user.save()
		}
		log.add(`${modulePrefix} Taken ${amount || 1} from ${_id}`)
	},
	getInventory: function(_id) {
		return editJsonFile(`./db/${_id}.json`).data.inventory
	},
	getItemInfo: function(item) {
		if (!module.exports.itemExists(item)) return {desc:"What is this?","value":"unknown"};
		var item = fs.readFileSync(__dirname+"/items/"+item+".js")
		return {desc: item.desc, value: item.value}
	},
	inStore: function(item, _id) {
		if (!module.exports.itemExists(item)) return false;
		return Object.keys(editJsonFile(`./sale.json`).data.items).includes(item) && editJsonFile(`./sale.json`).data.items[item].amount > 0
	},
	addToStore: function(item, _id, amount) {
		var store = editJsonFile(`./sale.json`)
		if (module.exports.hasItem(item, _id)) {
			store.data.items[item].amount += amount || 1
		} else {
			if (module.exports.itemExists(item)) user.data.inventory[item] = {
				amount: amount || 1
			}
		}
		user.save()
	},
	register: function(_id, name, timestamp, channel) {
		if (valid_id(_id)) {												 // if the _id is a valid _id by being 24 characters long:
			if (!channel) {													 // 01.) if there is no channel value provided for the user's lastseen in property:
				channel = "[unknown]";										 // 02.) 01: simply set it to "unknown"
			}
			if (!timestamp) {												 // 03.) if there is no dateandtime value provided for the user's lastseen on propery:
				timestamp = "[unknown]"; 								  	 // 04.) 01: simply set it to "unknown"
			}
			var user = editJsonFile(`./db/${_id}.json`)					 // 05.) fetch user's data (this will be blank at this point)
			user.set({														 // 06.) create user's data with provided values
				"names": [name],
				"lastknownname": name,
				"rank": 1,
				"inventory": {
					"coin": {
						amount: 160
					}
				},
				"firstseen": timestamp,
				"lastseen": {
					"channel": channel,
					"time": timestamp
				},
				"inbox": [],
				"lastClaim": Date.now(),
				"sendAwayMessage": true
			})
			user.save()													 // 07.) save the changes
			log.add(`${modulePrefix} Registered: ${_id}, ${name}`)
		}
	}
}