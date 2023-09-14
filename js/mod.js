let modInfo = {
	name: "Prestige Tree Rewritten: New Game/",
	id: "ng/2",
	author: "Jacorb",
	pointsName: "points",
	discordName: "PT Rewritten Server",
	discordLink: "https://discord.gg/TFCHJJT",
	changelogLink: "https://github.com/Jacorb90/Prestige-Tree/blob/master/changelog.md",
    offlineLimit: 1,  // In hours
    initialStartPoints: new Decimal(10), // Used for hard resets and new players
	endgame: new Decimal("e3.14e16"),
	// specialEndgameText: "v1.3 Endgame: e3.14e16 Points",
}

// Set your version in num and name
let VERSION = {
	num: "1.3",
	patch: 1,
	name: "The Expansion Update",
}

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["doReset", "buy", "buyMax", "onPurchase", "blowUpEverything", "castAllSpells", "completeInBulk", "startMastery", "completeMastery"]

var alwaysKeepTheseVariables = ["primeMiles", "auto", "autoExt", "autoBld", "autoW", "autoGhost", "autoSE", "autoNN", "keepPosNeg", "distrAll", "spellInput", "pseudoUpgs", "maxToggle"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return hasUpgrade("p", 11);
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(0.5).mul(player.hp.hyperpoints.add(1).pow(1000).pow(player.hp.challenges[11]>=1?tmp.omega.effect:1)) //HALVEDLOL
	if (hasMilestone("omega", 0)) gain = gain.times(2)
	if (hasMilestone("omega", 3)) gain = gain.times(new Decimal(10).pow(tmp.paradox.effect.root(2)))
	if (player.paradox.unlocked) gain = gain.times(tmp.paradox.effectPow)
	if (hasUpgrade("paradox", 13)) gain = gain.times(tmp.paradox.effect2)
	if (hasUpgrade("paradox", 14)) gain = gain.times(new Decimal(308.25471555991675).mul(tmp.t.enEff))
	if (hasUpgrade("p", 12)) gain = gain.times(upgradeEffect("p", 12)); //HALVEDLOL
	if (hasUpgrade("p", 13)) gain = gain.times(upgradeEffect("p", 13)); //HALVEDLOL
	if (hasUpgrade("p", 22)) gain = gain.times(upgradeEffect("p", 22)); //HALVEDLOL
	if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) gain = gain.times(upgradeEffect("b", 11)) //HALVEDLOL
	if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("e"):false) && hasUpgrade("e", 12)) gain = gain.times(upgradeEffect("e", 12))
	if (hasAchievement("a", 21)) gain = gain.times(1.05); //HALVEDLOL
	if (hasAchievement("a", 31)) gain = gain.times(1.5); //HALVEDLOL
	if (player.shenanigans.unlocked) gain = gain.times(tmp.shenanigans.buyables[11].effect)
	if (inChallenge("h", 22)) return gain.times(player.s.unlocked?buyableEffect("s", 11):1).root(inChallenge("h", 31)?tmp.h.pointRoot31:1);
	
	if (player.b.unlocked) gain = gain.times(tmp.b.effect);
	if (player.g.unlocked) gain = gain.times(tmp.g.powerEff);
	if (player.t.unlocked) gain = gain.times(tmp.t.enEff);
	if (player.s.unlocked) gain = gain.times(buyableEffect("s", 11));
	if (player.h.unlocked) gain = gain.times(tmp.h.effect);
	if (player.q.unlocked) gain = gain.times(tmp.q.enEff);
	
	if (inChallenge("h", 31)) gain = gain.root(tmp.h.pointRoot31);
	if (hasUpgrade("ss", 43)) gain = gain.pow(gain.lt(tmp.ss.upgrades[43].endpoint)?1.05:1.005); //HALVEDLOL
	if (hasUpgrade("hn", 31)) gain = gain.pow(1.025); //HALVEDLOL
	if (gain > 1) gain = gain.pow(tmp.omega.effect)
	return gain
}

function canSuperGenPoints(){
	return true
}

// Calculate points/sec!
function getSuperPointGen() {
	if(!canSuperGenPoints())
		return new Decimal(0)

	let gain = tmp.hp.buyables[11].effect.mul(tmp.hp.buyables[21].effect).mul(player.hp.superGenPower.add(1).root(3))
    if(player.omega.points.gte(5)) gain = gain.mul(tmp.o.solPow.mul(tmp.ss.eff2.add(1)).pow(tmp.o.solPow.pow(tmp.ss.eff2.add(1))))
	if(inChallenge("hp",11)&&player.hp.alphaLevel>=1) gain = gain.sqrt()
	return gain.root(inChallenge("hp",11)?new Decimal(1).add(player.hp.alphaLevel/3):1)
}

function getRow1to6Speed() {
	let speed = new Decimal(1);
	if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("t"):false) speed = speed.times(tmp.t.effect2)
	return speed;
}

function shenanigansBingo() {
	let BINGO = new Decimal(0)
	if(hasAchievement("ng/", 11, 12, 13, 14, 15, 16)) BINGO = BINGO.add(1)
	if(hasAchievement("ng/", 21, 22, 23, 24, 25, 26)) BINGO = BINGO.add(1)
	if(hasAchievement("ng/", 31, 32, 33, 34, 35, 36)) BINGO = BINGO.add(1)
	if(hasAchievement("ng/", 41, 42, 43, 44, 45, 46)) BINGO = BINGO.add(1)
	if(hasAchievement("ng/", 51, 52, 53, 54, 55, 56)) BINGO = BINGO.add(1)
	if(hasAchievement("ng/", 61, 62, 63, 64, 65, 66)) BINGO = BINGO.add(1)
	return BINGO
}

function unlockedLayers() {
	let count = new Decimal(0)
	let id = ["p", "b", "g", "t", "e", "s", "sb", "sg", "h", "q", "o", "ss", "m", "ba", "ps", "hn", "n", "hs", "i", "ma", "ge", "mc", "en", "ne", "id", "r", "ai", "c"]
	for (let i = 0; i < 27; i++) {
		if(player[id[i]].unlocked) count = count.add(1)
	}
	return count
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	function() { return player.devSpeed>1?"(("+format(getPointGen().mul(player.devSpeed))+"/s))":"" }
]

// Determines when the game "ends"
function isEndgame() {
	if (modInfo.endgame.eq(1/0)) return false;
	else return player.points.gte(modInfo.endgame)
}



// Less important things beyond this point!

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600000) // Default is 1 hour which is just arbitrarily large
}

// Variables that must be defined to display notifications
var activeNotifications = [];
var notificationID = 0;

// Function to show notifications
function addNotification(type="none",text="This is a test notification.",title="",timer=3) {
	switch(type) {
		case "achievement":
			notificationTitle = "Achievement Unlocked!";
			notificationType = "achievement-notification"
			break;
		case "milestone":
			notificationTitle = "Milestone Gotten!";
			notificationType = "milestone-notification"
			break;
		case "challenge":
			notificationTitle = "Challenge Complete";
			notificationType = "challenge-notification"
			break;
		default:
			notificationTitle = "Something Happened?";
			notificationType = "default-notification"
			break;
	}
	if(title != "") notificationTitle = title;
	notificationMessage = text;
	notificationTimer = timer; 

	activeNotifications.push({"time":notificationTimer,"type":notificationType,"title":notificationTitle,"message":(notificationMessage+"\n"),"id":notificationID})
	notificationID++;
}


//Function to reduce time on active notifications
function adjustNotificationTime(diff) {
	for(notification in activeNotifications) {
		activeNotifications[notification].time -= diff;
		if(activeNotifications[notification]["time"] < 0) {
			activeNotifications.splice(notification,1); // Remove notification when time hits 0
		}
	}
}