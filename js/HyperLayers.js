addLayer("sp", {
        name: "super prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "SP", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        color: "#31aeb0",
        requires: new Decimal(10), // Can be a function that takes requirement increases into account
        resource: "super prestige points", // Name of prestige currency
        baseResource: "super points", // Name of resource prestige is based on
        baseAmount() {return player.hp.hyperpoints}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return 0.5 }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
			if (hasUpgrade("sp", 21)) mult = mult.times(1.8);
			if (hasUpgrade("sp", 23)) mult = mult.times(upgradeEffect("sp", 23));
			if (hasUpgrade("b", 11)) mult = mult.times(upgradeEffect("b", 11));
			if (hasUpgrade("g", 11)) mult = mult.times(upgradeEffect("g", 11));
			if (hasUpgrade("b", 31)) mult = mult.times(upgradeEffect("b", 31));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            let exp = new Decimal(1)
			if (hasUpgrade("sp", 31)) exp = exp.times(1.05);
			return exp;
        },
        row: -65535, // Row the layer is in on the tree (0 is the first row)
        layerShown(){return true},
		//passiveGeneration() { return (hasMilestone("g", 1))?1:0 },
		doReset(resettingLayer) {
			let keep = [];
			player.hp.hyperpoints = new Decimal(0)
			if (hasMilestone("b", 0) && resettingLayer=="b") keep.push("upgrades")
			if (hasMilestone("g", 0) && resettingLayer=="g") keep.push("upgrades")
			if (layers[resettingLayer].row > this.row) layerDataReset("sp", keep)
		},
		startData() { return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			pseudoUpgs: [],
			first: 0,
		}},
		upgrades: {
			rows: 4,
			cols: 4,
			11: {
				title: "Begin",
				description: "Generate 1 Super Point every second.",
				cost() { return new Decimal(1) },
			},
			12: {
				title: "Prestige Boost",
				description: "Super Prestige Points boost Point generation.",
				cost() { return new Decimal(1) },
				effect() {
					let eff = player.sp.points.plus(2).pow(0.5);
					if (hasUpgrade("g", 14)) eff = eff.pow(1.5);
					if (hasUpgrade("g", 24)) eff = eff.pow(1.4666667);
					eff = softcap("p12", eff);
					
					return eff;
				},
				unlocked() { return hasUpgrade("sp", 11) },
				effectDisplay() { return format(tmp.sp.upgrades[12].effect)+"x" },
				formula() { 
				
					let exp = new Decimal(0.5*(hasUpgrade("g", 14)?1.5:1)*(hasUpgrade("g", 24)?1.4666667:1));
					let f = "(x+2)^"+format(exp)
					if (upgradeEffect("sp", 12).gte("1e3500")) {
						f = "log(x+2)*"+format(Decimal.div("1e3500",3500).times(exp))
					}
					return f;
				},
			},
			13: {
				title: "Self-Synergy",
				description: "Points boost their own generation.",
				cost() { return new Decimal(5) },
				effect() { 
					let eff = player.sp.points.plus(1).log10().pow(0.75).plus(1);
					if (hasUpgrade("sp", 33)) eff = eff.pow(upgradeEffect("sp", 33));
					if (hasUpgrade("g", 15)) eff = eff.pow(upgradeEffect("g", 15));
					return eff;
				},
				unlocked() { return hasUpgrade("sp", 12) },
				effectDisplay() { return format(tmp.sp.upgrades[13].effect)+"x" },
				formula() { 
					let exp = new Decimal(1);
					if (hasUpgrade("sp", 33)) exp = exp.times(upgradeEffect("sp", 33));
					if (hasUpgrade("g", 15)) exp = exp.times(upgradeEffect("g", 15));
					return "(log(x+1)^0.75+1)"+(exp.gt(1)?("^"+format(exp)):"")
				},
			},
			21: {
				title: "More Prestige",
				description() { return "Prestige Point gain is increased by 80%." },
				cost() { return new Decimal(20) },
				unlocked() { return hasUpgrade("sp", 11) },
			},
			22: {
				title: "Upgrade Power",
				description: "Point generation is faster based on your Prestige Upgrades bought.",
				cost() { return new Decimal(75) },
				effect() {
					let eff = Decimal.pow(1.4, player.sp.upgrades.length);
					if (hasUpgrade("sp", 32)) eff = eff.pow(2);
					return eff;
				},
				unlocked() { return hasUpgrade("sp", 12) },
				effectDisplay() { return format(tmp.sp.upgrades[22].effect)+"x" },
				formula() { 
					let exp = new Decimal(hasUpgrade("sp", 32)?2:1);
					return exp.gt(1)?("(1.4^x)^"+format(exp)):"1.4^x" 
				},
			},
			23: {
				title: "Reverse Super Prestige Boost",
				description: "Prestige Point gain is boosted by your Points.",
				cost() { return new Decimal("5e3") },
				effect() {
					let eff = player.sp.points.plus(1).log10().cbrt().plus(1);
					if (hasUpgrade("sp", 33)) eff = eff.pow(upgradeEffect("sp", 33));
					if (hasUpgrade("g", 23)) eff = eff.pow(upgradeEffect("g", 23));
					return eff;
				},
				unlocked() { return hasUpgrade("sp", 13) },
				effectDisplay() { return format(tmp.sp.upgrades[23].effect)+"x" },
				formula() { 
					let exp = new Decimal(1);
					if (hasUpgrade("sp", 33)) exp = exp.times(upgradeEffect("sp", 33));
					if (hasUpgrade("g", 23)) exp = exp.times(upgradeEffect("g", 23));
					return exp.gt(1)?("(log(x+1)^(1/3)+1)^"+format(exp)):"log(x+1)^(1/3)+1"
				},
			},
			31: {
				title: "WE NEED MORE PRESTIGE",
				description: "Prestige Point gain is raised to the power of 1.05.",
				cost() { return new Decimal("1e45") },
				unlocked() { return hasUpgrade("sp", 21) },
			},
			32: {
				title: "Still Useless",
				description: "<b>Upgrade Power</b> is squared.",
				cost() { return new Decimal("1e56") },
				unlocked() { return hasUpgrade("sp", 22) },
			},
			33: {
				title: "Column Leader",
				description: "Both above upgrades are stronger based on your Total Prestige Points.",
				cost() { return new Decimal("1e60") },
				effect() { return player.sp.total.plus(1).log10().plus(1).log10().div(5).plus(1) },
				unlocked() { return hasUpgrade("sp", 23) },
				effectDisplay() { return "^"+format(tmp.sp.upgrades[33].effect) },
				formula() { return "log(log(x+1)+1)/5+1" },
			},
		},
})

addNode("spnode", {
    symbol: "SP",
    color: '#31aeb0',
    layerShown: true,
    canClick() {return true},
	onClick() {player.tab = "sp"},
    tooltip: "Super Prestige",
	nodeStyle() {return { "border-radius": "50%" } }
}, 
)

function dotheFunny() {
	let treetesting = ["tree", treeTest][1]
	for(let i=0;i<6;i++) {
			let theRow = new Decimal(-65534).add(i)
			let prevGeneration = theRow.sub(1)
			let bName = "b"+theRow
			let gName = "g"+theRow
			let bName2 = "b"+prevGeneration
			let gName2 = "g"+prevGeneration
			addLayer(bName, {
				name: "super boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
				symbol: bName, // This appears on the layer's node. Default is the id with the first letter capitalized
				position(){return new Decimal(-1).sub(i)}, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
				color: "#6e64c4",
				requires() { return new Decimal(200).times((player[bName].unlockOrder&&!player[bName].unlocked)?5000:1) }, // Can be a function that takes requirement increases into account
				resource: "super boosters", // Name of prestige currency
				baseResource: "super points", // Name of resource prestige is based on
				baseAmount() {return player.hp.hyperpoints}, // Get the current amount of baseResource
				type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
				branches() {return (i==0)?["sp"]:[bName+(theRow.sub(1))]},
				exponent() { return 1.25 }, // Prestige currency exponent
				base() { return 5 },
				gainMult() { 
					let mult = new Decimal(1);
					if (hasUpgrade(bName, 23)) mult = mult.div(upgradeEffect(bName, 23));
					return mult;
				},
				canBuyMax() { return hasMilestone(bName, 1) },
				row() {return theRow}, // Row the layer is in on the tree (0 is the first row)
				layerShown(){return player.sp.unlocked},
				automate() {},
				addToBase() {
					let base = new Decimal(0);
					if (hasUpgrade(bName, 12)) base = base.plus(upgradeEffect(bName, 12));
					if (hasUpgrade(bName, 13)) base = base.plus(upgradeEffect(bName, 13));
					return base;
				},
				effectBase() {
					let base = new Decimal(2);
					
					// ADD
					base = base.plus(tmp[bName].addToBase);
					
					return base.pow(tmp[bName].power);
				},
				power() {
					let power = new Decimal(1);
					return power;
				},
				effect() {
					return Decimal.pow(tmp[bName].effectBase, player[bName].points).max(0);
				},
				effectDescription() {
					return "which are boosting Super Point generation by "+format(tmp[bName].effect)+"x"+(tmp.nerdMode?"\n ("+format(tmp[bName].effectBase)+"x each)":"")
				},
				doReset(resettingLayer) {
					let keep = [];
					if (layers[resettingLayer].row > this.row) layerDataReset(bName, keep)
				},
				startData() { return {
					unlocked: false,
					points: new Decimal(0),
					best: new Decimal(0),
					total: new Decimal(0),
					pseudoUpgs: [],
					first: 0,
					auto: false,
				}},
				autoPrestige() { return false },
				increaseUnlockOrder: [gName],
				milestones: {
					0: {
						requirementDescription: "8 Super Boosters",
						done() { return player[bName].best.gte(8) },
						effectDescription: "Keep Super Prestige Upgrades on reset.",
					},
					1: {
						requirementDescription: "15 Super Boosters",
						done() { return player[bName].best.gte(15) },
						effectDescription: "You can buy max Super Boosters.",
					},
				},
				upgrades: {
					rows: 3,
					cols: 4,
					11: {
						title: "SBP Combo",
						description: "Best Super Boosters boost Super Prestige Point gain.",
						cost() { return new Decimal(3) },
						effect() { 
							let ret = player[bName].best.sqrt().plus(1);
							if (hasUpgrade(bName, 32)) ret = Decimal.pow(1.125, player[bName].best).times(ret);
							return ret;
						},
						unlocked() { return player[bName].unlocked },
						effectDisplay() { return format(tmp[bName].upgrades[11].effect)+"x" },
						formula() { 
							let base = "sqrt(x)+1"
							if (hasUpgrade(bName, 32)) base = "(sqrt(x)+1)*(1.125^x)"
							let exp = new Decimal(1)
							let f = exp.gt(1)?("("+base+")^"+format(exp)):base;
							return f;
						},
					},
					12: {
						title: "Cross-Contamination",
						description: "Super Generators add to the Super Booster effect base.",
						cost() { return new Decimal(7) },
						effect() {
							let ret = player[gName].points.add(1).log10().sqrt().div(3);
							return ret;
						},
						unlocked() { return player[bName].unlocked&&player[gName].unlocked },
						effectDisplay() { return "+"+format(tmp[bName].upgrades[12].effect) },
						formula() { 
							let exp = new Decimal(1);
							let f = "sqrt(log(x+1))/3"
							if (exp.gt(1)) f = "("+f+")^"+format(exp);
							return f;
						},
					},
					13: {
						title: "SPB Reversal",
						description: "Total Super Prestige Points add to the Super Booster effect base.",
						cost() { new Decimal(8) },
						effect() { 
							let ret = player.sp.total.add(1).log10().add(1).log10().div(3)
							return ret;
						},
						unlocked() { return player[bName].unlocked&&player[bName].best.gte(7) },
						effectDisplay() { return "+"+format(tmp[bName].upgrades[13].effect) },
						formula() { 
							let exp = new Decimal(1)
							let f = "log(log(x+1)+1)/3"
							if (exp.gt(1)) f = "("+f+")^"+format(exp);
							return f;
						},
					},
					21: {
						title: "Super Gen Z^2",
						description: "Square the Super Generator Power effect.",
						cost() { return new Decimal(9) },
						unlocked() { return hasUpgrade(bName, 11) && hasUpgrade(bName, 12) },
					},
					22: {
						title: "Up to the Fifth Floor",
						description: "Raise the Super Generator Power effect ^1.2.",
						cost() { return new Decimal(15) },
						unlocked() { return hasUpgrade(bName, 12) && hasUpgrade(bName, 13) },
					},
					23: {
						title: "Discount One",
						description: "Super Boosters are cheaper based on your Super Points.",
						cost() { return new Decimal(18) },
						effect() { 
							let ret = player.hp.hyperpoints.add(1).log10().add(1).pow(3.2);
							return ret;
						},
						unlocked() { return hasUpgrade(bName, 21) || hasUpgrade(bName, 22) },
						effectDisplay() { return "/"+format(tmp[bName].upgrades[23].effect) },
						formula: "(log(x+1)+1)^3.2",
					},
					31: {
						title: "Worse SBP Combo",
						description: "Super Boosters boost Super Prestige Point gain.",
						cost() { return new Decimal(103) },
						unlocked() { return hasUpgrade(bName, 23) },
						effect() { 
							let exp = 1
							return Decimal.pow(1e20, player.sb.points.pow(1.5)).pow(exp); 
						},
						effectDisplay() { return format(tmp[bName].upgrades[31].effect)+"x" },
						formula() { 
							let exp = 1
							return "1e20^(x^1.5)"+(exp==1?"":("^"+format(exp)));
						},
					},
					32: {
						title: "Better SBP Combo",
						description() { return "<b>SBP Combo</b> uses a better formula"+(tmp.nerdMode?" (sqrt(x+1) -> (1.125^x)*sqrt(x+1))":"")+"." },
						cost() { return new Decimal(111) },
						unlocked() { return hasUpgrade(bName, 23) },
					},
				},
		})
		
			addLayer(gName, {
				name: "super generators", // This is optional, only used in a few places, If absent it just uses the layer id.
				symbol: "SG", // This appears on the layer's node. Default is the id with the first letter capitalized
				position(){return new Decimal(1).add(i)}, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
				color: "#a3d9a5",
				requires() { return new Decimal(200).times((player[gName].unlockOrder&&!player[gName].unlocked)?5000:1) }, // Can be a function that takes requirement increases into account
				resource: "super generators", // Name of prestige currency
				baseResource: "super points", // Name of resource prestige is based on
				baseAmount() {return player.hp.hyperpoints}, // Get the current amount of baseResource
				type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
				branches() {return (i==0)?["sp"]:[gName+(theRow.sub(1))]},
				exponent() { return new Decimal(1.25) }, // Prestige currency exponent
				base() { return new Decimal(5) },
				gainMult() {
					let mult = new Decimal(1);
					if (hasUpgrade(gName, 22)) mult = mult.div(upgradeEffect(gName, 22));
					return mult;
				},
				canBuyMax() { return hasMilestone(gName, 2) },
				row() {return theRow}, // Row the layer is in on the tree (0 is the first row)
				layerShown(){return player.sp.unlocked},
				automate() {},
				resetsNothing() { return false },
				effBase() {
					let base = new Decimal(2);
					
					// ADD
					if (hasUpgrade(gName, 12)) base = base.plus(upgradeEffect(gName, 12));
					if (hasUpgrade(gName, 13)) base = base.plus(upgradeEffect(gName, 13));
					
					
					return base;
				},
				effect() {
					let eff = Decimal.pow(this.effBase(), player[gName].points).sub(1).max(0);
					if (hasUpgrade(gName, 21)) eff = eff.times(upgradeEffect(gName, 21));
					if (hasUpgrade(gName, 25)) eff = eff.times(upgradeEffect(gName, 25));
					return eff;
				},
				effectDescription() {
					return "which are generating "+format(tmp[gName].effect)+" Super Generator Power/sec"+(tmp.nerdMode?"\n ("+format(tmp[gName].effBase)+"x each)":"")
				},
				update(diff) {
					if (player[gName].unlocked) player[gName].power = player[gName].power.plus(tmp[gName].effect.times(diff));
				},
				startData() { return {
					unlocked: false,
					points: new Decimal(0),
					best: new Decimal(0),
					total: new Decimal(0),
					power: new Decimal(0),
					pseudoUpgs: [],
					first: 0,
					auto: false,
				}},
				autoPrestige() { return false },
				powerExp() {
					let exp = new Decimal(1/3);
					if (hasUpgrade(bName, 21)) exp = exp.times(2);
					if (hasUpgrade(bName, 22)) exp = exp.times(1.2);
					return exp;
				},
				powerEff() {
					if (!unl(this.layer)) return new Decimal(1);
					return player[gName].power.plus(1).pow(this.powerExp());
				},
				doReset(resettingLayer) {
					let keep = [];
					player[gName].power = new Decimal(0);
					if (layers[resettingLayer].row > this.row) layerDataReset(gName, keep)
				},
				tabFormat: ["main-display",
					"prestige-button",
					"blank",
					["display-text",
						function() {return 'You have ' + format(player[gName].power) + ' Super Generator Power, which boosts Super Point generation by '+format(tmp[gName].powerEff)+'x'+(tmp.nerdMode?" ((x+1)^"+format(tmp[gName].powerExp)+")":"")},
							{}],
					"blank",
					["display-text",
						function() {return 'Your best Super Generators is ' + formatWhole(player[gName].best) + '<br>You have made a total of '+formatWhole(player[gName].total)+" Super Generators."},
							{}],
					"blank",
					"milestones", "blank", "blank", "upgrades"],
				increaseUnlockOrder: [bName],
				milestones: {
					0: {
						requirementDescription: "8 Generators",
						done() { return player[gName].best.gte(8) },
						effectDescription: "Keep Super Prestige Upgrades on reset.",
					},
					1: {
						requirementDescription: "10 Generators",
						done() { return player[gName].best.gte(10) },
						effectDescription: "You gain 100% of Super Prestige Point gain every second.",
					},
					2: {
						requirementDescription: "15 Generators",
						done() { return player[gName].best.gte(15) },
						effectDescription: "You can buy max Super Generators.",
					},
				},
				upgrades: {
					rows: 3,
					cols: 5,
					11: {
						title: "SGP Combo",
						description: "Best Super Generators boost Super Prestige Point gain.",
						cost() { return new Decimal(3) },
						effect() { return player[gName].best.sqrt().plus(1) },
						unlocked() { return player[gName].unlocked },
						effectDisplay() { return format(tmp[gName].upgrades[11].effect)+"x" },
						formula() { return "sqrt(x)+1" },
					},
					12: {
						title: "I Need More!",
						description: "Super Boosters add to the Super Generator base.",
						cost() { return new Decimal(7) },
						effect() { 
							let ret = player[bName].points.add(1).log10().sqrt().div(3);
							return ret;
						},
						unlocked() { return player[bName].unlocked&&player[gName].unlocked },
						effectDisplay() { return "+"+format(tmp[gName].upgrades[12].effect) },
						formula() { 
							let m = new Decimal(1).div(3)
							return "sqrt(log(x+1))"+(m.eq(1)?"":(m.gt(1)?("*"+format(m)):("/"+format(m.pow(-1)))));
						},
					},
					13: {
						title: "I Need More II",
						description: "Best Super Prestige Points add to the Super Generator base.",
						cost() { return new Decimal(8) },
						effect() { 
							let ret = player.sp.best.add(1).log10().add(1).log10().div(3)
							return ret;
						},
						unlocked() { return player[gName].best.gte(8) },
						effectDisplay() { return "+"+format(tmp[gName].upgrades[13].effect) },
						formula() { 
							let m = new Decimal(1).div(3)
							return "log(log(x+1)+1)"+(m.eq(1)?"":(m.gt(1)?("*"+format(m)):("/"+format(m.pow(-1)))));
						},
					},
					14: {
						title: "Super Boost the Super Boost",
						description() { return "<b>Super Prestige Boost</b> is raised to the power of 1.5." },
						cost() { return new Decimal(13) },
						unlocked() { return player[gName].best.gte(10) },
					},
					15: {
						title: "Outer Synergy",
						description: "<b>Self-Synergy</b> is stronger based on your Super Generators.",
						cost() { return new Decimal(15) },
						effect() { 
							let eff = player[gName].points.sqrt().add(1);
							if (eff.gte(400)) eff = eff.cbrt().times(Math.pow(400, 2/3))
							return eff;
						},
						unlocked() { return hasUpgrade(gName, 13) },
						effectDisplay() { return "^"+format(tmp[gName].upgrades[15].effect) },
						formula() { return upgradeEffect(gName, 15).gte(400)?"((x+1)^(1/6))*(400^(2/3))":"sqrt(x)+1" },
					},
					21: {
						title: "I Need More III",
						description: "Super Generator Power boost its own generation.",
						cost() { return new Decimal("1e10") },
						currencyDisplayName: "super generator power",
						currencyInternalName: "power",
						currencyLayer: gName,
						effect() { 
							let ret = player[gName].power.add(1).log10().add(1);
							return ret;
						},
						unlocked() { return hasUpgrade(gName, 15) },
						effectDisplay() { return format(tmp[gName].upgrades[21].effect)+"x" },
						formula() { 
							let exp = new Decimal(1);
							let f = "log(x+1)+1";
							if (exp.gt(1)) f = "("+f+")^"+format(exp);
							return f;
						},
					},
					22: {
						title: "Discount Two",
						description: "Super Generators are cheaper based on your Super Prestige Points.",
						cost() { return new Decimal("1e11") },
						currencyDisplayName: "super generator power",
						currencyInternalName: "power",
						currencyLayer: gName,
						effect() { 
							let eff = player.sp.points.add(1).pow(0.25);
							return eff;
						},
						unlocked() { return hasUpgrade(gName, 15) },
						effectDisplay() { return "/"+format(tmp[gName].upgrades[22].effect) },
						formula: "(x+1)^0.25",
					},
					23: {
						title: "Double Reversal",
						description: "<b>Reverse Super Prestige Boost</b> is stronger based on your Super Boosters.",
						cost() { return new Decimal("1e12") },
						currencyDisplayName: "super generator power",
						currencyInternalName: "power",
						currencyLayer: gName,
						effect() { return player[bName].points.pow(0.85).add(1) },
						unlocked() { return hasUpgrade(gName, 15)&&player[bName].unlocked },
						effectDisplay() { return "^"+format(tmp[gName].upgrades[23].effect) },
						formula: "x^0.85+1",
					},
					24: {
						title: "Super Boost the Super Boost Again",
						description: "<b>Super Prestige Boost</b> is raised to the power of 1.467.",
						cost() { return new Decimal(20) },
						unlocked() { return hasUpgrade(gName, 14)&&(hasUpgrade(gName, 21)||hasUpgrade(gName, 22)) },
					},
					25: {
						title: "I Need More IV",
						description: "Super Prestige Points boost Super Generator Power gain.",
						cost() { return new Decimal("1e14") },
						currencyDisplayName: "super generator power",
						currencyInternalName: "power",
						currencyLayer: gName,
						effect() { 
							let ret = player.sp.points.add(1).log10().pow(3).add(1);
							return ret;
						},
						unlocked() { return hasUpgrade(gName, 23)&&hasUpgrade(gName, 24) },
						effectDisplay() { return format(tmp[gName].upgrades[25].effect)+"x" },
						formula() { 
							let f = "log(x+1)^3+1";
							return f;
						},
					},
				}
		})
			
			addNode((bName+"node"), {
				symbol: "SB",
				color: '#6e64c4',
				layerShown: true,
				canClick() {return true},
				onClick() {player.tab = bName},
				tooltip: "Super Booster",
				branches() {return (i==0)?["spnode"]:["b"+(theRow.sub(1))+"node"]},
				nodeStyle() {return { "border-radius": "50%" } }
			})
			addNode((gName+"node"), {
				symbol: "SG",
				color: '#a3d9a5',
				layerShown: true,
				canClick() {return true},
				onClick() {player.tab = gName},
				tooltip: "Super Generator",
				branches() {return (i==0)?["spnode"]:["g"+(theRow.sub(1))+"node"]},
				nodeStyle() {return { "border-radius": "50%" } }
			})
			if(!i==0 && layers[bName2].position().eq(layers[gName2].position().sub(2))) {
				addNode("hp"+theRow, {
				symbol: "HP",
				color: "#185758",
				layerShown: true,
				canClick() {return true},
				tooltip: "Hyper Prestige Point",
				branches() {return [bName2+"node", gName2+"node"]},
				nodeStyle() {return { "border-radius": "50%" } }
			})
			}
			let spaceyes = [bName+"node", "blank", gName+"node"]
			if (!i==0 && layers[bName2].position().eq(layers[gName2].position().sub(2))) spaceyes = [bName+"node", "blank", "hp"+theRow, "blank", gName+"node"]
			treeTest.push(spaceyes)
	}
}

dotheFunny()