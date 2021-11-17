// by corbex

const cmdname = "echo";

module.exports = {
	category: "Songs",
	enabled: true,
	hidden: false,
	wip: false,
	rank: 1,
	status: "This command is active by default.",
	description: "Sets the level of note echo on requested songs.",
	usage: `%cmdprefix%${cmdname} <1-10>`,
	execute: function (msg, cmdprefix, sendChat, EOS, input) {
		if (!input) {
			EOS.temp.midiEcho = 0;
			sendChat("Echo was disabled.");
		} else if (isNaN(input)) {
			sendChat("Enter a number! (Usage: "+module.exports.usage.replace(/%cmdprefix%/g, cmdprefix)+")");
		} else if (0 <= Number(input) && Number(input) <= 11) {
			EOS.temp.midiEcho = Number(input);
		} else {
			sendChat("Why not try a number between 1 and 10 instead?");
		}
	}
}