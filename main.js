var stateSwitchTimer = 0;
var setupLevel = function() {
    Brick.BRICK_SPEED = levelThings[currLevel][1];
    levelLength = levelThings[currLevel][2];
};
var setupUpgrade = function() {
    upgradeChoices = [];
    //Choose three different upgrades from currPossibleUpgrades as the upgrades.
    var tempThing = currPossibleUpgrades.slice();
    for(var i = 0; i < 3; i ++) {
        if(tempThing.length > 0) {
            var id = Math.floor(getRand() * tempThing.length);
            upgradeChoices.push(tempThing[id]);
            tempThing.splice(id, 1);
        }
    }
};
var switchState = function(target) {
    gameState = target;
    stateSwitchTimer = 0;
    switch(target) {
        case "playing":
            setupLevel();
            offsetY = 0;
            tileOffset = 0;
            bricks = [];
            balls = [];
            levelLeft = levelLength;
            paddle.pos.x = canvas.width / 2 - paddle.size.x / 2;
            paddle.vel.mult(0);
            Brick.spawnBricks();
            spawnBalls();
            break;
        case "win":
            currLevel ++;
            winUpgrades = 3;
            setupUpgrade();
            break;
        case "lose":
            console.log("AHA YIOU GOT TO level " + (currLevel+1));
            break;
    }
};
var mainMenu = {
    buttons: [//button constructor (x,y,w,h,txt)
        {b: new Button(h100 * 10, h100 * 30, h100 * 80, h100 * 10, "start >:)"), thing: () => switchState("playing")}
    ],
    go: function() {
        ctx.fillStyle = "rgb(100, 100, 100";
        for(var i = 0; i < this.buttons.length; i ++) {
            this.buttons[i].b.go();
            if(this.buttons[i].b.pressed) {
                this.buttons[i].thing();
            }
        }
    }
};
var lives = 3;
//switchState("playing");
var frame = function() {

    screenshake.update();
    canvas.style.transform = `translate(${screenshake.x}px, ${screenshake.y}px)`;
    
    if(justPressed["p"]) {
        paused = !paused;
    }
    if(paused) {
        pauseScreen();
    }
    else {
        switch(gameState) {
            case "mainMenu":
                mainMenu.go();
                break;
            case "playing":
                if(stateSwitchTimer === 1 || stateSwitchTimer === 31) {
                    soundEffects.countdown1.play();
                }
                else if(stateSwitchTimer === 61) {
                    soundEffects.countdown2.play();
                }
                game();
                break;
            case "win":
                //offset of doom
                var t = limit(stateSwitchTimer / 45 - 1, 0, 1);
                if(t < 1) {
                    updateGame(false, 0.5);
                }
                var offsetY = -easings.easeInOutQuad(t) * canvas.height;
                ctx.save();
                ctx.translate(0, offsetY);
                displayGame();
                ctx.translate(0, canvas.height);
                upgradeScreen();
                ctx.restore();
                break;
            case "lose":
                displayGame();
                //darkness of doom
                var t = limit(stateSwitchTimer / 45, 0, 1);
                var opacity = easings.easeInOutQuad(t) / 2;
                ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                //variable shenanigans
                ctx.fillStyle = "rgb(206, 58, 36)";
                ctx.strokeStyle = "rgb(141, 34, 17)";
                ctx.lineWidth = h100;

                ctx.font = "5em cursive";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                //text falls out of sky
                var t = Math.min(stateSwitchTimer / 120, 1);
                var r = 0.2 * Math.sin(stateSwitchTimer/20);
                var y = canvas.height / 3 + canvas.height * (easings.easeOutQuad(t)-1);
                ctx.save();
                ctx.translate(canvas.width / 2, y);
                ctx.rotate(r);
                ctx.strokeText("Haha you lose", 0,0);
                ctx.fillText(  "Haha you lose", 0,0);
                ctx.restore();
                
                //hearts for no reason
                var t = limit(stateSwitchTimer / 30 - 5, 0, 1);
                ctx.globalAlpha = easings.easeInOutQuad(t);
                for(var i = 0; i < lives; i ++) {
                    var x = canvas.width / 8 * (i - (lives-1)/2) + canvas.width / 2;
                    if(i !== lives-1 || stateSwitchTimer < 190) {
                        drawHeart(ctx, x, canvas.height / 2, h100/10);
                    }
                }
                ctx.globalAlpha = 1;
                if(stateSwitchTimer === 190) {
                    soundEffects.loseLife.play();
                    screenshake.shake(4);
                    Particle.spawnParticles(15, (x, y, o) => {Particle.squareParticle(x, y, 1, "255, 0, 0")}, x, canvas.height / 2);
                }

                //other text just like appears idk
                var t2 = limit(stateSwitchTimer / 60 - 4, 0, 1);//just realized it's supposed to be called clamp
                var opacity = easings.easeInOutQuad(t2);
                ctx.fillStyle = `rgba(150, 150, 150, ${opacity})`;
                ctx.strokeStyle = `rgba(100, 100, 100, ${opacity})`;
                ctx.strokeText("press space to yee", canvas.width / 2, canvas.height * 7/8);
                ctx.fillText(  "press space to yes", canvas.width / 2, canvas.height * 7/8);
                
                Particle.runParticles();//do the particling

                if(justPressed[" "]) {//sense for spaces
                    if(lives > 1) {
                        lives --;
                        switchState("equip");
                    }
                    else {
                        inventory = [];
                        equip = [["normal", 1]];
                        currLevel = 0;
                        lives = 3;
                        switchState("playing");
                    }
                }
                break;
            case "equip":
                equipScreen();
                break;
        }
    }

    justPressed = [];
    mouse.justPressed = false;
    mouse.justReleased = false;
    stateSwitchTimer ++;
    window.requestAnimationFrame(frame);
};
window.requestAnimationFrame(frame);
/*
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillStyle = "white";
ctx.strokeStyle = "black";
ctx.font = "6em cursive";
ctx.lineWidth = h100;
ctx.strokeText("click to start :)", canvas.width / 2, canvas.height / 2);
ctx.fillText(  "click to start :)", canvas.width / 2, canvas.height / 2);
//window.requestAnimationFrame(frame);
*/