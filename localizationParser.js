/*
>> Node.js Application Framework
>> localizationParser.js

>> If this file has been modified from the original source material please check (/) this box: [] (just to keep things organized and consistent) */

// Dependencies ++
const log = require("./log.js")
const config = require("./config.json")
const lzt = require("./lzt.json")
const fs = require("fs")
// Dependencies --

const modulePrefix = "[LOCALIZATION_PARSER]"

log.add(`${modulePrefix} Running.`)

module.exports = {
	parse: function (string_id) {
		return new Promise(function(resolve, reject) {
			fs.exists(`./localizations/${config.default_localization}.json`, function(exists) {
				if (exists) {
					var localization = require(`./localizations/${config.default_localization}.json`)
					var output = localization.txt[string_id]
					if (output) {
						Object.keys(lzt).forEach(tag => {
							output = output.replace(RegExp(tag, "g"), config[lzt[tag]])
						})
					}
					resolve(output || "")
				} else {
					resolve("")
				}
			})
		})
	}
}