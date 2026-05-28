
var upgradeChoices = [];
var currPossibleUpgrades = [];
var possibleUpgrades = [
    {
        name: '3 NORMAL ball get',
        description: "normal",
        effect: function() {
            for(var i = 0; i < 3; i ++) {
                inventory.push(["normal", 1]);
            }
        },
        amount: 1,
        branchThing: "self"//infinity annd beeeoyingd
    },
    {
        name: 'VIRUS ball get',
        description: "does big damage over longer time\nto one thing",
        effect: function(player) {
            inventory.push(["virus", 1]);
        },
        amount: 4,
        branchThing: []//infinity annd beeeoyingd
    },
    {
        name: 'FIRE ball get',
        description: "does one damage to a larger area",
        effect: function(player) {
            inventory.push(["fire", 1]);
        },
        amount: 4,
        branchThing: []//infinity annd beeeoyingd
    },
    {
        name: 'GHOST ball get',
        description: "goes through stuff and damages\n of blocks when going through\nthem upwards\n\ncan't kill, it's a ghost >:)",
        effect: function(player) {
            inventory.push(["ghost", 1]);
        },
        amount: 2,
        branchThing: []//infinity annd beeeoyingd
    },
    {
        name: 'BARRIER ball get',
        description: "makes shield that protects other\nballs that aren't barrier balls\n(will not protect itself you dunk)",
        effect: function(player) {
            inventory.push(["barrier", 1]);
        },
        amount: 8,
        branchThing: []//infinity annd beeeoyingd
    },
    {
        name: 'WEaKEN ball get',
        description: "will spread\nweakness, causing bricks to take\n2x damage!!!!!",
        effect: function(player) {
            inventory.push(["weaken", 1]);
        },
        amount: 32,
        branchThing: []//infinity annd beeeoyingd
    },/*
    {
        name: '1 MORBILLION UBeRS GET',
        description: "morbiattle cats",
        effect: function(player) {
            for(var i = 0; i < 10; i ++) {
                inventory.push(["test", 1]);
            }
        },
        branchThing: []//infinity annd beeeoyingd
    }*/
];
var thingy = function(upgrades) {//loops through literally everything
    for(var i = 0; i < upgrades.length; i ++) {
        if(upgrades[i].branchThing === "self") {
            upgrades[i].branchThing = [upgrades[i]];
        }
        else {
            thingy(upgrades[i].branchThing);
        }
    }
};
thingy(possibleUpgrades);
for(var i = 0; i < possibleUpgrades.length; i ++) {
    currPossibleUpgrades.push(possibleUpgrades[i]);
}