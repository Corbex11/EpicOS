// by corbex

// Dependencies ++
const fs = require("fs");
const log = require("./log.js");
const config = require("./config.json");
const mppClient = require("./mppClient.js");
const midiPlayer = require("midi-player-js");
const colorName = require("hex-to-color-name");
const editJsonFile = require("edit-json-file");
const { registered, register, get, set, sendMessage } = require("./db.js");
const stringSimilarity = require("string-similarity");
// Dependencies --

const modulePrefix = "[APP]";

log.add(`${modulePrefix} Running.`);

const days = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday"
];

const months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November"
];

const MPPKeys = ["a-1", "as-1", "b-1", "c0", "cs0", "d0", "ds0", "e0", "f0", "fs0", "g0", "gs0", "a0", "as0", "b0", "c1", "cs1", "d1", "ds1", "e1", "f1", "fs1", "g1", "gs1", "a1", "as1", "b1", "c2", "cs2", "d2", "ds2", "e2", "f2", "fs2", "g2", "gs2", "a2", "as2", "b2", "c3", "cs3", "d3", "ds3", "e3", "f3", "fs3", "g3", "gs3", "a3", "as3", "b3", "c4", "cs4", "d4", "ds4", "e4", "f4", "fs4", "g4", "gs4", "a4", "as4", "b4", "c5", "cs5", "d5", "ds5", "e5", "f5", "fs5", "g5", "gs5", "a5", "as5", "b5", "c6", "cs6", "d6", "ds6", "e6", "f6", "fs6", "g6", "gs6", "a6", "as6", "b6", "c7"]
const convKeys = ["A0", "Bb0", "B0", "C1", "Db1", "D1", "Eb1", "E1", "F1", "Gb1", "G1", "Ab1", "A1", "Bb1", "B1", "C2", "Db2", "D2", "Eb2", "E2", "F2", "Gb2", "G2", "Ab2", "A2", "Bb2", "B2", "C3", "Db3", "D3", "Eb3", "E3", "F3", "Gb3", "G3", "Ab3", "A3", "Bb3", "B3", "C4", "Db4", "D4", "Eb4", "E4", "F4", "Gb4", "G4", "Ab4", "A4", "Bb4", "B4", "C5", "Db5", "D5", "Eb5", "E5", "F5", "Gb5", "G5", "Ab5", "A5", "Bb5", "B5", "C6", "Db6", "D6", "Eb6", "E6", "F6", "Gb6", "G6", "Ab6", "A6", "Bb6", "B6", "C7", "Db7", "D7", "Eb7", "E7", "F7", "Gb7", "G7", "Ab7", "A7", "Bb7", "B7", "C8"]

function newInstance(channel, server) {
var EOS = {
	cursorReserved: false,
	desiredChannel: channel,
	client: new mppClient(server),
	chat: {
		send: function(msg) {
			msg.match(/.{0,511}/g).forEach(function(x, i) {
				if (x == "") return;
				if (i !== 0) x = "" + x;
				EOS.temp.chatBuffer.push("\u034f"+x);
			})
			/*if(typeof string == "string"){
				if(string.length > 512){
					let self = this;
					let messages = [];
					string.match(/.{0,512}/g).forEach((str, i) => {
						if(str.length > 0) messages.push(str);
					});
					for(let msg of messages) EOS.chat.send(msg);
				}else{
					EOS.temp.outbox.push({"message": string, "time": Date.now()});
					EOS.client.sendArray([{ m:'a', message:string }]);
				}
			}else{
				EOS.chat.send("Error: Argument given is not a string.");
			}*/
		}
	},
	fun: {},
	intervalthatrunseverything: setInterval(function() {
		EOS.client.sendArray([{m: "a", message: EOS.temp.chatBuffer.shift()}]);
		EOS.temp.stats.uptimeSeconds ++;
		EOS.temp.secondsSinceLastMessage ++;
		if (EOS.temp.countSecondsSinceLastNote) {
			EOS.temp.secondsSinceLastNote ++;
		}
		if (EOS.temp.secondsSinceLastNote >= 60 && !EOS.temp.playingMIDI) {
			EOS.fun.playMIDI();
			EOS.temp.playingAutomaticMIDI = true;
		}
	}, 2000),
	twentyminutes: setInterval(function() {
		if (!EOS.temp.botSentLastMessage) {
			sendChat(EOS.fun.rando(
				// "New commands have arrived! Let's play Rock, Paper, Scissors ("+config.cmdprefix+"rps) or place our bets and "+config.cmdprefix+"roll the dice. '"+config.cmdprefix+"help roll' for more info.",
				"Care for a game of pong? Try "+config.cmdprefix+"pong to play a round with an opponent of your choice!",
				"hi"
				)
			)
		}
	}, 1200000),
	interval: setInterval(function() {
		if (EOS.temp.awayRecently.length > 0 && EOS.temp.awayRecently.length !== 1) {
			var msg = '';
			var names = [];
			for (var i = 0; i < EOS.temp.awayRecently.length-1; i++) {
				var user = editJsonFile(`./db/${EOS.temp.awayRecently[0]._id}.json`);
				if (user.get("sendAwayMessage")) {
					msg += `${EOS.temp.awayRecently[i].name}${names.includes(EOS.temp.awayRecently[i].name)?" ("+colorName(EOS.temp.awayRecently[i].color)+")":""}, `;
					names.push(EOS.temp.awayRecently[i].name);
				}
			}
			var i = EOS.temp.awayRecently.length-1;
			msg += `and ${EOS.temp.awayRecently[i].name}${names.includes(EOS.temp.awayRecently[i].name)||EOS.temp.awayRecently[i].name=="Anonymous"?" ("+colorName(EOS.temp.awayRecently[i].color)+")":""} are away.`;
			sendChat(msg)
		} else if (EOS.temp.awayRecently.length == 1) {
			sendChat(`${EOS.temp.awayRecently[0].name}${EOS.temp.awayRecently[0].name=="Anonymous"?" ("+colorName(EOS.temp.awayRecently[0].color)+")":""} is away.. (∪｡∪)｡｡｡zzz`);
		};
		EOS.temp.awayRecently = [];
		if (!EOS.client.isConnected) {
			EOS.client.stop()
			setTimeout(() => {
				EOS.client.start()
				setTimeout(() => {
					sendChat("The connection was temporarily lost.")
				}, 4000)
			}, 2000)
		}
	}, 5000)
}


EOS.temp = {
	users: {},
	playingMIDI: false,
	playingAutomaticMIDI: false,
	midiQueue: [],
	midiEcho: 0,
	echoDelay: 10,
	MIDIinterruptionCount: 0,
	secondsSinceSomeoneWentAway: 0,
	secondsSinceLastMessage: 0,
	secondsSinceLastNote: 0,
	countSecondsSinceLastNote: true,
	connectedOnce: false, // prevents redefining listeners on reconnect
	botSentLastMessage: false,
	cursorReserved: false,
	chatBuffer: [],
	awayRecently: [],
	stats: {
		uptimeSeconds: 0,
		messagesSeen: 0,
		notesHeard: 0
	}
}

// Function Definitions ++
// minified with https://minify.js.org/
EOS.fun.suffixOf=function(f){var n=f%10,r=f%100;return 1==n&&11!=r?f+"st":2==n&&12!=r?f+"nd":3==n&&13!=r?f+"rd":f+"th"};
EOS.fun.getTimestamp=function(e){var t=e||new Date;return`${t.getHours()%12||12}:${t.getMinutes()} ${t.getHours()>=12?"PM":"AM"} on the ${EOS.fun.suffixOf(t.getDate())} of ${months[t.getMonth()]} ${t.getYear()+1900} (UTC+${t.getTimezoneOffset()/60})`};
EOS.fun.underline=function(n){for(var r="",e=0;e<n.length;e++)r+=n[e]+"̲";return r};
EOS.fun.zalgo=function(n){var r={0:["̍","̎","̄","̅","̿","̑","̆","̐","͒","͗","͑","̇","̈","̊","͂","̓","̈́","͊","͋","͌","̃","̂","̌","͐","̀","́","̋","̏","̒","̓","̔","̽","̉","ͣ","ͤ","ͥ","ͦ","ͧ","ͨ","ͩ","ͪ","ͫ","ͬ","ͭ","ͮ","ͯ","̾","͛","͆","̚"],1:["̖","̗","̘","̙","̜","̝","̞","̟","̠","̤","̥","̦","̩","̪","̫","̬","̭","̮","̯","̰","̱","̲","̳","̹","̺","̻","̼","ͅ","͇","͈","͉","͍","͎","͓","͔","͕","͖","͙","͚","̣"],2:["̕","̛","̀","́","͘","̡","̢","̧","̨","̴","̵","̶","͏","͜","͝","͞","͟","͠","͢","̸","̷","͡","҉"]},t=function(n){return 1==n?0:n?Math.floor(Math.random()*n+1)-1:Math.random()};return n.split("").map(function(n){if(" "==n)return n;for(var a=0,o=t(3);a<o;a++){var u=t(3);n+=r[u][t(r[u].length)]}return n}).join("")};
EOS.fun.makeCode=function(){return"abcdefghijklmnopqrstuvwxyz0123456789".split("").sort(function(){return.5-Math.random()}).join("").substring(0,24)};
EOS.fun.rando=function(r){return Array.isArray(r)||(r=Array.from(arguments)),r[Math.floor(Math.random()*r.length)]}; // from Fishing
EOS.fun.startBattle = function () {
	var getEnemy = function () { EOS.fun.rando("Abject terror","Abracadabrer","Alizarin","Armful","Astaroth","Auroral serpent","Balhib","Barbatos","Batmandrill","Beleth","Bilhaw","Bite bulb","Black dragon","Blizzybody","Bloody hand","Blue dragon","Bobonga","Bodkin archer","Bodkin bowyer","Bodkin fletcher","Boreal serpent","Boss troll","Brodysseus","Brollympian","Brownie","Bunicorn","Cactiball","Cactolotl","Chasmonaut","Cheater cheetah","Chewlip","Chihuawyrm","Chillanodon","Chimaera","Clockwyrm","Coralotl","Cosmic chimaera","Crabber dabber doo","Crabid","Crack-billed platypunk","Crimson killing machine","Cruelcumber","Crystalotl","Cureslime","Cyclops","Cyclown","Dark gryphon","Dark sabrecat","Darth voodoo","Deadnaut","Demonrider","Diethon (DQVI)","Drackmage","Drackolyte","Dracky","Drackyma","Dragon rider","Dragon slime","Dragon zombie","Dragooner","Dragurn","Drake slime","Dread dragooner","Drohl diabolist","Drohl drone","Eggsoskeleton","Elysium bird","Equinox","Ethereal serpent","Face invader","Fandangow","Fire-eater","Firebird","Flamethrower","Flython","Foo dog","Fortune filcher","Franticore","Fright bulb","Fromage flay","Fruity succubat","Funghoul","Gaia dragon","Garuda","Ghoul","Gigantes","Gnashturtium","Gold golem (Recurring)","Golden girl","Golden globe","Golem","Goodybag","Great dragon","Great keeper","Great sabrecat","Great sabrecub","Green dragon","Grim keeper","Gryphon","Hades' Condor","Hammerhood","Handsome crab","Harmachis","Healslime","Heavy hood","Heedoo voodoo","Hocus chimaera","Hocus-poker","Hood","Hoodlum","Hot dog","Hunter mech","Hybird","Hyperanemon","Hyperpyrexion","Hypothermion","Ice-breaker","Infanticore","Infernal armour","Infernal serpent","Iron maiden","Jargon","Jarvis","Jarvis's shadow","Jowler","Killing machine","King crab","King cureslime","King slime","King squid","Kisser","Knight Aberrant","Knight Abhorrent","Knight Errant","Leger-de-Man","Lethal armour","Liege lizard","Lips","Liquid metal slime","Little devil","Living Statue (Recurring)","Loss leader","Lump mage","Lump shaman","Lump wizard","Lunar chimaera","Man o' war","Manticore","Mecha-mynah","Mechan-o'-wyrm","Medislime","Merking","Merman","Mermaniac","Metal dragon","Metal dragon slime","Metal king slime","Metal slime","Metal slime knight","Miasma","Mimic","Moosifer","Morphean mushroom","Mud mannequin","Muddy hand","Mushroom mage","Night clubber","Noble dragon","Old man of the sea","One-man army","Orc","Orc king","Overkilling machine","Overtoad","Phoenix","Platinum poppet","Platypunk","Prestidigitator","Prince of darkness","Prowler jowler","Pteranodon","Raven lunatic","Red dragon","Restless armour","Robber rabbit","Robbin' 'Ood","Sail serpent","Seaslime","Shade","Shadow","Sham hatwitch","She-slime","Shell slime","Silhouette","Silvapithecus","Silver sabrecat","Skelegon","Skeleton swordsman","Skullrider") }
	var attacker = getEnemy()
}
EOS.fun.importMIDI = function() {
	fs.readdirSync(__dirname+"/midi").forEach(file => {
		if (file.includes(".mid") && isNaN(file.split(".mid")[0])) {
			var idcount = -1;
			fs.readdirSync(__dirname+"/midi").forEach(file => {if(!isNaN(file.split(".mid")[0])){idcount++;}})
			console.log("adding file "+(idcount+1)+".mid")
			fs.copyFileSync(__dirname+"/midi/"+file, __dirname+`/midi/${idcount+1}.mid`);
			fs.copyFileSync(__dirname+"/midi/"+file, __dirname+"/imidi/"+file);
			fs.unlinkSync(__dirname+"/midi/"+file);
			if (!fs.readFileSync("midinames.txt","utf8").split("\n").includes(file.split(".mid")[0])) {
				fs.appendFileSync("midinames.txt",file.split(".mid")[0]+"\n");
			}
		}
	})
}
EOS.fun.updateUserInformation = function (_id, name, event, color) {
	return new Promise(function(resolve) {
		if (!registered(_id)) {
			register(_id, name, EOS.fun.getTimestamp(), EOS.client.channel._id)
		} else {
			var user = editJsonFile(`./db/${_id}.json`)
			var names = user.get("names")
			if(!names.includes(name)){names.push(name);user.set("names", names)}
			user.set("lastknownname", name)
			user.set("lastseen", {"channel": EOS.client.channel._id, "time": EOS.fun.getTimestamp()})
			user.save()
			if (event == "message" || event == "join" || event == "mouse" || event == "note") {
				if (typeof EOS.temp.users[_id] == "undefined") {
					EOS.temp.users[_id] = {
						msgsendcounter: 0,
						awaytime: 0,
						away: false,
						lastPlayed: Date.now(),
						location: "outside"
					}
					if (!user.get("isBot")) {
						EOS.temp.users[_id].awaychecker = setInterval(function() {
							EOS.temp.users[_id].awaytime++
							if (EOS.temp.users[_id].awaytime == 300 && _id !== EOS.client.getOwnParticipant()._id) {
								EOS.temp.users[_id].away = true
								EOS.temp.awayRecently.push({"name":name,"_id":_id, "color":color})
							}
						}, 1000)
					}
				} else {
					if (event == "note") {
						EOS.temp.users[_id].lastPlayed = Date.now()
					}
					if (event == "message") {EOS.temp.users[_id].msgsendcounter++}
					EOS.temp.users[_id].awaytime = 0
					if (EOS.temp.users[_id].away) {
						EOS.temp.users[_id].away = false
						if (user.get("sendAwayMessage")) {
							setTimeout(function() {
								//sendChat(`${user.get("customReturnMessage")||"Hi, "+name+", and welcome back!"}`)
							}, 4000)
						}
					}
				}
				if (name.includes("(") || name.includes(")") || name.includes("[") || name.includes("]") || name.toLowerCase().includes("bot") || name.includes("Qhy") || name.includes("Bouncer") || name.includes("͏Theta")) {
					if (_id !== EOS.client.getOwnParticipant()._id && !user.get("hasBeenBotChecked") && name.toLowerCase().includes("help")) {
						EOS.fun.isBot(name, _id).then(function(output) {
							log.add(`${name} (${_id}) bot check result: ${output}`)
						})
					}
				}
			}
			if (event == "leave") {
				if (EOS.temp.users[_id]) {
					clearInterval(EOS.temp.users[_id].awaychecker)
					delete EOS.temp.users[_id]
				}
			}
		}
	})
}
EOS.fun.isBot = function (name, _id) {
	return new Promise(function(resolve, reject) {
		var user = editJsonFile(`./db/${_id}.json`)
		var done = false
		if (!user.get("hasBeenBotChecked") && _id !== EOS.client.getOwnParticipant()._id) {
			user.set("hasBeenBotChecked", true)
			user.save()
			// sendChat(`${name} will have their away message disabled in 30 seconds (unless they say "here")`)
			var handler = function (msg) {
				if (msg.p._id == _id) {
					if (msg.a.toLowerCase() == "here") {
						done = true
						EOS.client.off("a", handler)
						if (msg.a.toLowerCase() == "here") {
							resolve(false)
							user.set("isBot", false)
						}
						user.save()
					}
				}
				user.save()
			}
			EOS.client.on("a", handler)
			setTimeout(function() {
				if (!done) {
					EOS.client.off("a", handler)
					// sendChat(`${name} is now marked as a bot and their away message is disabled`)
					resolve(true)
					user.set("isBot", true)
					user.set("sendAwayMessage", false)
					user.save()
					if (EOS.temp.users[_id]) {
						if (EOS.temp.users[_id].awaychecker) {
							if (!EOS.temp.users[_id].awaychecker._destroyed) clearInterval(EOS.temp.users[_id].awaychecker);
						}
					}
				}
			}, 30000)
		} else {
			resolve(user.get("isBot"))
		}
	})
}
EOS.fun.circleFollow = function (part) { // by Ham's Music
	var ypos;
	var xpos;
	var ascend = true;
	var i = -500;
	EOS.temp.followInterval = setInterval(function(){
		if (!EOS.temp.cursorReserved) {
			if (ascend == true){
				i++
				xpos = part.x + (0.01)*i;
				ypos = 2*Math.sqrt(Math.pow(5,2) - Math.pow((xpos - part.x) ,2)) + (part.y);
			}
			else if (ascend == false){
				i--;
				xpos = part.x + (0.01)*i;
				ypos = (part.y) - 2*(Math.sqrt(Math.pow(5,2) - Math.pow((xpos - part.x) ,2)));
			}
			if (i == 500){
				ascend = false;
			}
			else if (i == -500){
				ascend = true;
			}
			EOS.client.sendArray([{m: "m", x: xpos, y: ypos}]);
		}
	},5);
}
EOS.fun.playMIDI = function (file) {
	EOS.temp.playingMIDI = true;
	EOS.temp.midiEcho = 0;
	EOS.temp.secondsSinceLastNote = 100;
	EOS.temp.countSecondsSinceLastNote = false;
	function conv(key) {
		return MPPKeys[convKeys.indexOf(key)] || key;
	}
	if (!EOS.temp.midiplayer) {
		EOS.temp.midiplayer = new midiPlayer.Player();
    	EOS.temp.midiplayer.on("midiEvent", async function(event) {
			for (var i = 0; i < EOS.temp.midiEcho+1; i++) {
    	  		if (event.channel == 10) return;
				if (event.name == "Set Tempo") {
					EOS.temp.midiplayer.setTempo(event.data);
				}
				if (event.name == "Note off" || (event.name == "Note on" && event.velocity === 0)) {
					EOS.client.stopNote(conv(event.noteName));
				} else if (event.name == "Note on") {
					EOS.client.startNote(conv(event.noteName), event.velocity / 100);
				}
				await timer(EOS.temp.echoDelay)
			}
		})
	} else {
		EOS.temp.midiplayer.stop();
	}
	var files = [];
	fs.readdirSync(`${__dirname}/midi`).forEach(file => {
		if (file.includes(".mid")) {
			files.push(file);
		}
    })
	EOS.temp.midiplayer.loadFile(`./midi/${file || files[Math.floor(Math.random() * files.length)]}`);
	EOS.temp.midiplayer.play();
	EOS.temp.midiplayer.on('endOfFile', function() {
		EOS.temp.playingMIDI = false;
		EOS.temp.playingAutomaticMIDI = false;
		EOS.temp.countSecondsSinceLastNote = true;
		EOS.temp.secondsSinceLastNote = 0;
		EOS.temp.midiEcho = 0;
		EOS.temp.echoDelay = 10;
		if (EOS.temp.midiQueue.length > 0) {
			setTimeout(() => {
				EOS.fun.playMIDI(EOS.temp.midiQueue.shift());
			}, 2000)
		}
	});
}
EOS.fun.waitForMessage = function (message, _id, time, callback) {
	var done = false;
	var handler = function (msg) {
		if (msg.p._id == _id) {
			if (msg.a == message) {
				done = true
				callback(false)
			}
		}
	}
	EOS.client.on("a", handler)
	setTimeout(function() {
		if (!done) {
			EOS.client.off("a", handler)
			callback(true)
		}
	}, time)
}
EOS.fun.pianoAnim = function (name, time) {
	if (name == "pacing") {
		var animInt = setInterval(async () => {
			for (var i = 0; i < MPPKeys.length; i++) {EOS.client.startNote(MPPKeys[i],0);await timer(50)}
			for (var i = MPPKeys.length; i > 0; i--) {EOS.client.startNote(MPPKeys[i],0);await timer(50)}
		}, 8800)
	}
	setTimeout(() => {
		clearInterval(animInt)
	}, time || 50)
}
EOS.fun.numberToEnglish = function (n, custom_join_character) {
/**
 * Convert an integer to its words representation
 * 
 * @author McShaman (http://stackoverflow.com/users/788657/mcshaman)
 * @source http://stackoverflow.com/questions/14766951/convert-digits-into-words-with-javascript
 */
    var string = n.toString(),
        units, tens, scales, start, end, chunks, chunksLen, chunk, ints, i, word, words;

    var and = custom_join_character || 'and';

    /* Is number zero? */
    if (parseInt(string) === 0) {
        return 'zero';
    }

    /* Array of units as words */
    units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

    /* Array of tens as words */
    tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    /* Array of scales as words */
    scales = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quatttuor-decillion', 'quindecillion', 'sexdecillion', 'septen-decillion', 'octodecillion', 'novemdecillion', 'vigintillion', 'centillion'];

    /* Split user arguemnt into 3 digit chunks from right to left */
    start = string.length;
    chunks = [];
    while (start > 0) {
        end = start;
        chunks.push(string.slice((start = Math.max(0, start - 3)), end));
    }

    /* Check if function has enough scale words to be able to stringify the user argument */
    chunksLen = chunks.length;
    if (chunksLen > scales.length) {
        return '';
    }

    /* Stringify each integer in each chunk */
    words = [];
    for (i = 0; i < chunksLen; i++) {

        chunk = parseInt(chunks[i]);

        if (chunk) {

            /* Split chunk into array of individual integers */
            ints = chunks[i].split('').reverse().map(parseFloat);

            /* If tens integer is 1, i.e. 10, then add 10 to units integer */
            if (ints[1] === 1) {
                ints[0] += 10;
            }

            /* Add scale word if chunk is not zero and array item exists */
            if ((word = scales[i])) {
                words.push(word);
            }

            /* Add unit word if array item exists */
            if ((word = units[ints[0]])) {
                words.push(word);
            }

            /* Add tens word if array item exists */
            if ((word = tens[ints[1]])) {
                words.push(word);
            }

            /* Add 'and' string after units or tens integer if: */
            if (ints[0] || ints[1]) {

                /* Chunk has a hundreds integer or chunk is the first of multiple chunks */
                if (ints[2] || !i && chunksLen) {
                    words.push(and);
                }

            }

            /* Add hundreds word if array item exists */
            if ((word = units[ints[2]])) {
                words.push(word + ' hundred');
            }

        }

    }

    return words.reverse().join(' ');

}
// Function Definitions --

var sendChat = EOS.chat.send;

EOS.client.start();

EOS.client.on("hi", () => {
	if (!EOS.temp.connectedOnce) {
		EOS.temp.connectedOnce = true;
		EOS.fun.pianoAnim("pacing", 490000)
		log.add(`${modulePrefix} ${EOS.fun.getTimestamp()}`);
		log.add(`${modulePrefix} Connected to MPP server @ ${server}`);
		log.add(`${modulePrefix} Starting in channel: ${EOS.desiredChannel}`);
		EOS.client.setChannel(EOS.desiredChannel);
		EOS.client.sendArray([{ m: "userset", set: { name: `๖ۣۜCorbex [${config.cmdprefix}help]`  } }])
		//sendChat(`> ๖ۣۜCorbex Chat Entertainment System, v${config.version}, is now online. Beep boop.`)
		//sendChat(`> You may send ${config.cmdprefix}help to access my command list.`)
		var capt=100
		var cbpt=200
		var x_coord = 50
		var y_coord = 30
		//var cursor_programming_1 = setInterval(function() {if (!EOS.temp.cursorReserved){x_coord++;if(x_coord > 99){x_coord = -45}}}, capt)
		//var cursor_programming_2 = setInterval(function() {if (!EOS.temp.cursorReserved){y_coord++;if(y_coord > 99){y_coord = -5}}}, cbpt)
		//setInterval(function() {if(!EOS.temp.cursorReserved){EOS.client.sendArray([{m: "m", x: x_coord, y: y_coord}])}}, 0)
		EOS.client.on("a", function(msg) {
			// log.add(`${server}:${EOS.desiredChannel}:${msg.p._id} | ${msg.p.name}: ${msg.a}`);
			/*if (msg.p._id !== EOS.client.getOwnParticipant()._id) {
				clearInterval(EOS.temp.followInterval);
				EOS.fun.circleFollow(EOS.client.ppl[msg.p.id]);
			}*/
			EOS.temp.stats.messagesSeen++;
			EOS.temp.botSentLastMessage = msg.p._id == EOS.client.getOwnParticipant()._id;
			EOS.temp.secondsSinceLastMessage = 0;
			EOS.fun.updateUserInformation(msg.p._id, msg.p.name, "message", msg.p.color);
			var user = editJsonFile(`./db/${msg.p._id}.json`);
			if (user.get("banInformation") && user.get("banInformation.expiration") && Date.now() >= user.get("banInformation.expiration")) {
				sendChat(`Hey ${msg.p.name}, your ban has expired.`);
				user.unset("banInformation");
				user.save();
			}
			
			// check inbox:
			if (get("inbox", msg.p._id)) {
				var i = -1; var n = 0;
				get("inbox", msg.p._id).forEach(function(message) {
					i++; if (!message.read && !message.told) n++; user.data.inbox[i].told = true;
				})
				if (n > 0) {
					user.save()
					var messageCount=EOS.fun.numberToEnglish(n);var messageCount=messageCount.startsWith("and ")?messageCount.substring(4,messageCount.length):messageCount;
					sendChat(msg.p.name+", you've got mail! You have: "+messageCount+" new message(s) | To view your messages, send "+config.cmdprefix+"inbox")
				}
			}

			// easter-eggs:
			if (msg.a.toLowerCase()=="back"&&Math.random()>0.5){sendChat("Front!")}
			if (msg.a.toLowerCase()=="who am i?"){sendChat(EOS.fun.rando("Lynette Gearheart", "Thurman Kirven", "Hunter Lucia", "Anita Gailey", "Tawanna Heslin", "William Faulcon", "Roland Oros", "Wilhemina Easter", "Roxane Alley", "Felice Grennan", "Cherly Franchi", "Cecelia Lakes", "Enda Heider", "Shaneka Lei", "Jarred Lebow", "Crystle Azcona", "Elia Guthridge", "Florance Tanguay", "Khadijah Rotz", "Amiee Krogman", "Freddy Lindsey", "Naomi Lussier", "Mallie Solares", "Jodi Mess", "Joana Ried", "Greg Buffaloe", "Magen Eichelberger", "Shellie Greenlaw", "Jacinta Greek", "Maura Siegmund", "Marvis Duet", "Gertrude Sauter", "Daryl Powley", "Grace Bradburn", "Nicol Moriarity", "Tarsha Humbert", "Sonia Chi", "Tammara Jacobs", "Jenine Paulos", "Donella Mankin", "Jeromy Norman", "Kelsi Hang", "Magaret Blan", "Ilene Sharon", "Dominique Overlock", "Emelda Markell", "Rosana Huskey", "Dwain Benton", "Jaleesa Tolleson"))}
 			
			// command processing:
			if (msg.a.startsWith(config.cmdprefix) && msg.a !== config.cmdprefix) {
				
				// fetch arguments:
				var cmd = msg.a.toLowerCase().split(config.cmdprefix)[1].split(" ")[0];
				var input = msg.a.substring(config.cmdprefix.length+cmd.length).trim();

				// check if banned:
				if (user.get("banInformation")) {
					if (!user.get("banInformation.toldAboutBan")) {
						sendChat(config.banMessage || "Thank you for visiting our china shop, come again soon.")
						user.set("banInformation.toldAboutBan", true)
						user.save()
					}
				} else {
					
					// sendChat(`You were${user.data.banInformation.automatic?" automatically ":" "}banned ${user.data.banInformation.reason?" for "+user.data.banInformation.reason+".":"."} This ban ${user.data.banInformation.expiration?" expires at "+EOS.fun.getTimestamp(Date.parse(user.data.banInformation.expiration)):" doesn't expire"}`)
					
					// aliases and exceptions:
					if (cmd == "p") var cmd = "play";
					if (cmd == "s") var cmd = "search";
					if (cmd == "u") var cmd = "upload";
					if (cmd == "h") var cmd = "help";
					if (cmd == "bal") var cmd = "balance";
					if (cmd == "8") var cmd = "8ball";

					fs.exists(`${__dirname}/cmds/${cmd}.js`, function(exists) {
						if (!exists) {
							var cmds = []
							fs.readdirSync(__dirname+"/cmds").forEach(file => {
								if (file.includes('.js')) {
									if (!require(`./cmds/${file}`).hidden) {
										if (require(`./cmds/${file}`).enabled) {
											cmds.push(file.split(".js")[0])
										}
									}
								}
							})
							if (!cmd.includes("?")) {
								//cmd = stringSimilarity.findBestMatch(cmd, cmds).bestMatch.target
							}
						} else {
							var cmdfile = require(`./cmds/${cmd}.js`)
							delete require.cache[require.resolve(`./cmds/${cmd}.js`)]
							if (cmdfile.enabled) {
								if (user.get("rank") >= cmdfile.rank) {
									try {
										var cmdstats=editJsonFile(`./cmds/stats/cmdstats-${cmd}.json`);if(!cmdstats.data.uses){cmdstats.data={"uses":1,"since":EOS.fun.getTimestamp()}}else{cmdstats.data.uses++};cmdstats.save()
										cmdfile.execute(msg, config.cmdprefix, sendChat, EOS, input)
										log.add(`[cmd/${cmd}] executed by ${msg.p._id} (${msg.p.name})`)
									} catch (err) {
										sendChat("My apologies, this command isn't working right now. Try again later.")
										cmdfile.enabled = false
										log.add(err)
									}
								} else {
									sendChat("My apologies, but you don't have access to that command.")
								}
							} else {
								sendChat("My apologies, but that command is currently unavailable.")
							}
						}
					})
				}
			}
		})
		EOS.client.on("participant added", function(msg) {
			EOS.fun.updateUserInformation(msg._id, msg.name, "join", msg.color)
			log.add(`${server}:${EOS.desiredChannel}:${msg._id} | ${msg.name} joined the channel`)
		})
		EOS.client.on("participant removed", function(msg) {
			EOS.fun.updateUserInformation(msg._id, msg.name, "leave", msg.color)
			log.add(`${server}:${EOS.desiredChannel}:${msg._id} | ${msg.name} left the channel`)
		})
		EOS.client.on("m", function(msg) {
			EOS.fun.updateUserInformation(EOS.client.ppl[msg.id]._id, EOS.client.ppl[msg.id].name, "mouse", EOS.client.ppl[msg.id].color)
		})
		EOS.client.on("n", function(msg) {
			for (var i = 0; i < msg.n.length; i++) {
				if (MPPKeys.includes(msg.n[i].n) && typeof msg.n[i].v !== "undefined") { // These rules ensure that we're recording legitimate note events
					EOS.temp.secondsSinceLastNote = 0
					EOS.temp.stats.notesHeard++
					EOS.fun.updateUserInformation(EOS.client.ppl[msg.p]._id, EOS.client.ppl[msg.p].name, "note", EOS.client.ppl[msg.p].color)
					var _id = EOS.client.ppl[msg.p]._id;
					if (EOS.temp.users[_id].beingRecorded) {
						EOS.temp.users[_id].recordedNotes.push({"n": msg.n[i].n, "d": new Date(EOS.temp.users[_id].lastPlayed).getMilliseconds()-new Date().getMilliseconds()})
					}
					if (EOS.temp.playingMIDI) {
						EOS.temp.MIDIinterruptionCount++
						if (EOS.temp.MIDIinterruptionCount >= 20) {
							EOS.temp.MIDIinterruptionCount = 0
							if (EOS.temp.playingAutomaticMIDI) {
								EOS.temp.midiplayer.stop()
							}
						}
					}
				}
			}
		})
	}
})
}

const timer = ms => new Promise(res => setTimeout(res, ms))

async function join () {
	for (var i1 = 0; i1 < Object.keys(config.servers).length; i1++) {
		for (var i = 0; i < config.servers[Object.keys(config.servers)[i1]].length; i++) {
			var ch = config.servers[Object.keys(config.servers)[i1]][i]
			var ws = Object.keys(config.servers)[i1]
			newInstance(ch, ws)
			await timer(3000)
		}
	}
}

join()