// by corbex

// Dependencies ++
const editJsonFile = require("../node_modules/edit-json-file")
const path = require("path")
const fs = require("fs")
// Dependencies --

const cmdname = "help"

module.exports = {
	category: "Tools",
	enabled: true,
	hidden: true,
	wip: false,
	rank: 1,
	status: "This command is active by default.",
	description: "Displays a list of commands & their functions.",
	usage: `%cmdprefix%${cmdname} <command-name> (optional)`,
	execute: function (msg, cmdprefix, sendChat, EOS, input) {
		var user = editJsonFile(path.join(__dirname, `../db/${msg.p._id}.json`))
		if (!input) {
			var help = {}
			fs.readdirSync(__dirname).forEach(file => {
				if (file.includes('.js')) {
					if (!require(`./${file}`).hidden) {
						if (require(`./${file}`).enabled) {
							if (!Object.keys(help).includes(require(`./${file}`).category)){help[require(`./${file}`).category]=[]}
							help[require(`./${file}`).category].push(`${cmdprefix}${file.split(".js")[0]}`)
						}
					}
				}
			})
			if (!EOS.client.channel.crown) {
				// list version:
				for (var i = 0; i < Object.keys(help).length; i++) {
					sendChat(`>> ${EOS.fun.underline(Object.keys(help)[i])} >> ${help[Object.keys(help)[i]].join(", ")}`)
				}
			} else {
				// shortened:
				var str = ''
				for (var i = 0; i < Object.keys(help).length; i++) {
					if (!str.includes(EOS.fun.underline(Object.keys(help)[i]))) str += EOS.fun.underline(Object.keys(help)[i])+": "+help[Object.keys(help)[i]].join(", ")+" | "
				}
				sendChat(str.substring(0,str.length-3))
				if (!user.get("hasBeenToldAboutSpecificCmdHelp")) {
					sendChat(`For help with a specific command, you may send ${cmdprefix}help <command name>`)
					user.set("hasBeenToldAboutSpecificCmdHelp", true)
					user.save()
				}
			}
		} else {
			fs.exists(path.join(__dirname, `../cmds/${input}.js`), function(exists) {
				if (exists) {
					sendChat(`>> Help | ${input} >> ${require(path.join(__dirname, "../cmds/"+input+".js")).description} || Rank: ${require(path.join(__dirname, "../cmds/"+input+".js")).rank} || Usage: ${require(path.join(__dirname, "../cmds/"+input+".js")).usage.replace(/%cmdprefix%/g, cmdprefix)}`)
				} else {
					sendChat(`A command by that name does not exist in this bot. You may send "${cmdprefix}help" for a list of valid commands.`)
				}
			})
		}			
	}
}