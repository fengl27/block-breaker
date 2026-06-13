
var upgradeChoices = [];
var currPossibleUpgrades = [];
var possibleUpgrades = [
    {
        name: '3 NORMAL ball get',
        description: "The most basic ball type.\n\nPierces through bricks at higher levels.",
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
        description: "does huge damage to one brick at a time.",
        effect: function(player) {
            inventory.push(["virus", 1]);
        },
        amount: 4,
        branchThing: []//infinity annd beeeoyingd
    },
    {
        name: 'FIRE ball get',
        description: "does one damage to a large area of bricks, spreading to bricks nearby.",
        effect: function(player) {
            inventory.push(["fire", 1]);
        },
        amount: 4,
        branchThing: []//infinity annd beeeoyingd
    },
    {
        name: 'GHOST ball get',
        description: "Goes through blocks, damaging them as it moves upwards through them.\n\ncan't kill, it's a ghost",
        effect: function(player) {
            inventory.push(["ghost", 1]);
        },
        amount: 2,
        branchThing: []//infinity annd beeeoyingd
    },
    {
        name: 'BARRIER ball get',
        description: "makes shield that protects other balls that aren't barrier balls\n(will not protect itself you dunk)",
        effect: function(player) {
            inventory.push(["barrier", 1]);
        },
        amount: 8,
        branchThing: []//infinity annd beeeoyingd
    },
    {
        name: 'WEaKEN ball get',
        description: "will spread weakness across a large area, causing them to take twice the damage.\n\nWeakens more at higher levels.",
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
        upgrades[i].description = upgrades[i].description.split("\n").join(" \n ");//so that when i split by spaces it separates \n as its own word
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