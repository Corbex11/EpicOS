// by corbex

const cmdname = "test";

module.exports = {
	category: "Games",
	enabled: true,
	hidden: true,
	wip: false,
	rank: 1,
	status: "This command is active by default.",
	description: "This magic ball may just hold the answers to your questions..!",
	usage: `%cmdprefix%${cmdname}`,
	execute: function (msg, cmdprefix, sendChat, EOS, input) {
		EOS.fun.waitForMessage(input, msg.p._id, 10000, function() {
			sendChat("received")
		})
		sendChat("waiting for you to say: "+input)
	}
}