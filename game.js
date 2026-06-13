spawnBalls();

var displayGame = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //ctx.translate(screenshake.x, screenshake.y);
    
    paddle.display();
    for(var i = 0; i < bricks.length; i ++) {
        bricks[i].display();
    }
    for(var i = 0; i < balls.length; i ++) {
        balls[i].display();
    }
    Particle.runParticles();//do the particling
};
var updateGame = function(canLose, gameSpeed) {//not really game speed just for the effect at the end
    if(1===(gameSpeed||1) || stateSwitchTimer % 2 === 0) {
        paddle.update();
    }
    for(var i = 0; i < balls.length; i ++) {
        balls[i].update(gameSpeed);
        if(balls[i].dead) {
            balls.splice(i, 1);
            i --;
        }
    }
    Brick.runDamageTick();
    
    offsetY += Brick.BRICK_SPEED;
    for(var i = 0; i < bricks.length; i ++) {
        bricks[i].pos.y += Brick.BRICK_SPEED;
        if(bricks[i].update) bricks[i].update();
        if(bricks[i].dead) {
            bricks.splice(i, 1);
            i --;
        }
    }
    if(offsetY > 0) {
        offsetY -= Brick.BRICK_SIZE.y + Brick.BRICK_MARGIN;
        tileOffset --;
        Brick.spawnBrickRow(offsetY + Brick.BRICK_MARGIN, tileOffset);
    }
    if(canLose) {//then check for state changes
        if(bricks.length === 0 && levelLeft < 0) {
            //hehe win
            screenshake.shake(20);
            soundEffects.finalKill.play();
            switchState("win");
        }
        else if(balls.length === 0) {
            switchState("lose");
        }
    }
};
var game = function() {
    updateGame(true);
    displayGame();
    /*
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    screenshake.update();
    ctx.save();
    ctx.translate(screenshake.x, screenshake.y);

    paddle.update();
    paddle.display();

    //update balls
    for(var i = 0; i < balls.length; i ++) {
        balls[i].update();
        if(balls[i].dead) {
            balls.splice(i, 1);
            i --;
        }
    }

    //run bricks
    Brick.runDamageTick();
    
    offsetY += Brick.BRICK_SPEED;
    for(var i = 0; i < bricks.length; i ++) {
        bricks[i].pos.y += Brick.BRICK_SPEED;
        bricks[i].display();
        if(bricks[i].dead) {
            bricks.splice(i, 1);
            i --;
        }
    }
    if(offsetY > 0) {
        offsetY -= Brick.BRICK_SIZE.y + Brick.BRICK_MARGIN;
        tileOffset --;
        Brick.spawnBrickRow(offsetY + Brick.BRICK_MARGIN, tileOffset);
    }

    //display balls
    for(var i = 0; i < balls.length; i ++) {
        balls[i].display();
    }


    if(Brick.BRICK_SPEED < Brick.TARGET_BRICK_SPEED) {
        Brick.BRICK_SPEED += Brick.BRICK_ACC;
        if(Brick.BRICK_SPEED > Brick.TARGET_BRICK_SPEED) {
            Brick.BRICK_SPEED = Brick.TARGET_BRICK_SPEED;
        }
        //console.log(canvas.height / Brick.BRICK_SPEED);
    }
    if(bricks.length === 0 && levelLeft < 0) {
        //hehe win
        gameState = "win";
    }
    else if(balls.length === 0) {
        gameState = "lose";
    }
    ctx.restore();
    */
};
var winUpgrades;
var upgradeScreen = function() {
    if(upgradeScreen.buyTimer > 0) {
        upgradeScreen.buyTimer --;
        if(upgradeScreen.buyTimer <= 0) {
            setupUpgrade();
        }
    }
    var yTranslate = upgradeScreen.buyTimer > 0? easings.easeInOutQuad((20-upgradeScreen.buyTimer)/20) * canvas.height: 0;
    if(upgradeChoices.length === 0) {
        switchState("equip");
    }
    
    ctx.fillStyle = "rgb(70,70,70)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    //draw upgardesed

    ctx.strokeStyle = "rgb(255, 255, 255)";
    ctx.lineWidth = h100 / 2;
    ctx.textAlign = "left";
    ctx.textBaseline = "hanging";
    
    var thingWidth = canvas.width / upgradeChoices.length;
    var margin = h100;
    var thingOffsetY = margin + 9*h100;
    var thingHeight = canvas.height - margin - thingOffsetY;

    //Draw upgrade rectangles
    for(var i = 0; i < upgradeChoices.length; i ++) {
        var x = i * thingWidth;
        //The rect part
        ctx.fillStyle = "rgb(100,100,100)";
        rect(
            ctx,
            x + margin,
            thingOffsetY + yTranslate,
            thingWidth - 2 * margin,
            thingHeight,
            true,
            true
        );
        if(yTranslate !== 0) {
            //transitions amirite
            rect(
                ctx,
                x + margin,
                thingOffsetY + yTranslate - canvas.height,
                thingWidth - 2 * margin,
                thingHeight,
                true,
                true
            );
        }
        //Struggle drawing text
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.font = 6*h100 + "px pixelFont";
        ctx.fillText(upgradeChoices[i].name, x + 2 * margin, thingOffsetY + margin + yTranslate, thingWidth - 4 * margin, thingHeight - 2 * margin);
        ctx.font = 2*h100 + "px pixelFontSmall";
        var words = upgradeChoices[i].description.split(" ");
        words.push("\n");//so that it displays the last line
        var currLine = "";
        var lineIdx = 0;
        for(var j = 0; j < words.length; j ++) {
            if(words[j] === "\n" || ctx.measureText(currLine + words[j]).width > thingWidth-4*margin) {
                ctx.fillText(currLine, x + 2 * margin, yTranslate + thingOffsetY + margin+4*h100+lineIdx*2*h100);
                currLine = "";
                lineIdx ++;
            }
            if(words[j] !== "\n") {
                currLine += words[j] + " ";
            }
        }
        //Buy detection
        if(upgradeScreen.buyTimer <= 0 && mouse.justPressed && IsPointInAABB(
            mouse,
            {x: x + margin, y: thingOffsetY},
            {x: thingWidth - 2 * margin, y: thingHeight})) {
            //Purchase
            upgradeChoices[i].effect();
            soundEffects.purchase.play();
            
            currPossibleUpgrades = currPossibleUpgrades.concat(upgradeChoices[i].branchThing);
            var currId = currPossibleUpgrades.indexOf(upgradeChoices[i]);
            currPossibleUpgrades[currId].amount --;
            if(currPossibleUpgrades[currId].amount <= 0) {//delete now now now now now now now now
                currPossibleUpgrades.splice(currId, 1);
            }
            winUpgrades --;
            if(winUpgrades > 0) {
                upgradeScreen.buyTimer = 20;
            }
            else {
                switchState('equip');
            }
            //break;
        }
    }
    //draw title thingy
    

    ctx.textAlign = "center";
    ctx.font = 10*h100 + "px pixelFont";

    ctx.fillStyle = "black";
    ctx.fillText  ("Choose an upgrade!", canvas.width / 2 + h100/5, h100 * 2 + h100/3);
    ctx.fillStyle = "white";
    ctx.fillText  ("Choose an upgrade!", canvas.width / 2, h100 * 2);
};
upgradeScreen.buyTimer = 0;
var pauseScreen = function() {
    ctx.fillStyle = "rgb(70,70,70)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(234, 234, 234)";
    ctx.strokeStyle = "rgb(0, 0, 0)"
    ctx.lineWidth = h100 / 2;

    ctx.font = 8*h100 + "px pixelFont";
    ctx.textAlign = "center";
    ctx.textBaseline = "hanging";
    ctx.strokeText("Paused!", canvas.width / 2, h100 * 2);
    ctx.fillText  ("Paused!", canvas.width / 2, h100 * 2);

    var sadBallDisplay = function([type, level], x, y) {
        displayBall(type, x, y, h100*4);
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 0.3*h100;
        ctx.textAlign = "center";
        ctx.font = 3*h100 + "px pixelFont";
        ctx.strokeText("Lv. " + level, x + h100 * 1.5, y - h100 * 3.5);
        ctx.fillText("Lv. " + level, x + h100 * 1.5, y - h100 * 3.5);
    };
    var y = 23*h100;
    ctx.font = 5*h100 + "px pixelFont";
    ctx.textAlign = "left";
    ctx.fillText("Equip:", 3*h100, 11*h100);
    ctx.fillText("Inventory:", 3*h100, 48*h100-12*h100);
    for(var i = 0; i < equip.length; i ++) {
        var x = (i + 0.5) * h100*10;
        //display the actual ball
        sadBallDisplay(equip[i], x, y);
    }
    for(var i = 0; i < inventory.length; i ++) {
        var x = ((i%10)+0.5) * h100*10;
        var y = 48*h100 + h100*10*Math.floor(i/10);
        //display the actual ball
        sadBallDisplay(inventory[i], x, y);
    }
};
var equipScreen = function() {
    //bg
    ctx.fillStyle = "rgb(70,70,70)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //big title

    ctx.font = 10*h100 + "px pixelFont";
    ctx.textAlign = "center";
    ctx.textBaseline = "hanging";

    ctx.fillStyle = "black";
    ctx.fillText  ("EQUIP!", canvas.width / 2 + h100/5, h100 * 2 + h100/3);
    ctx.fillStyle = "white";
    ctx.fillText  ("EQUIP!", canvas.width / 2, h100 * 2);
    

    //equip/inv label
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.font = 5*h100 + "px pixelFont";
    ctx.fillText("EQUIP", canvas.width/2, 9*h100);
    ctx.fillText("INVENTORY", canvas.width/2, 34*h100);

    //actual equip/inv boxes
    ctx.lineWidth = h100 / 2;
    ctx.fillStyle = "rgb(100,100,100)";
    ctx.strokeStyle = "black";
    rect(ctx, h100 * 2, 13*h100, h100 * 96, 20*h100, true, true);

    ctx.fillStyle = "rgb(130,130,130)";
    rect(ctx, h100 * 2, 38*h100, h100 * 96, 60*h100, true, true);

    var spaghettiDragging = function(container, x, y, i, depressed) {
        if(dist(mouse.x, mouse.y, x, y) < h100*9) {
            if(!equipScreen.currDragging && mouse.justPressed) {
                //happy
                soundEffects.equipPickup.play();
                equipScreen.currDragging = container[i];
                container.splice(i, 1);
            }
            else if(equipScreen.currDragging && mouse.justReleased) {
                //UNhappy
                soundEffects.equipPlace.play();
                if(equipScreen.currDragging[0] === container[i][0] &&
                        equipScreen.currDragging[1] === container[i][1] && keys.shift) {
                    //SPAGHETTI merg
                    container[i][1] ++;
                    soundEffects.equipMerge.play();
                }
                else if(depressed || equip.length < 5) {
                    container.splice(i, 0, equipScreen.currDragging);
                }
                else {
                    inventory.push(container[i]);
                    container.splice(i, 1, equipScreen.currDragging);
                }
                equipScreen.currDragging = false;
            }
        }
    };
    var sadBallDisplay = function([type, level], x, y) {
        displayBall(type, x, y, h100*7);
        if(true) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 0.4*h100;
            ctx.strokeText("Lv. " + level, x + h100 * 5, y - h100 * 5);
            ctx.fillText("Lv. " + level, x + h100 * 5, y - h100 * 5);
        }
    };

    //contents
    var y = 23*h100;
    for(var i = 0; i < equip.length; i ++) {
        var x = canvas.width/2 + (i-2)*h100*18;
        //display the actual ball
        sadBallDisplay(equip[i], x, y);

        spaghettiDragging(equip, x, y, i);
    }

    //inv contents
    
    for(var i = 0; i < inventory.length; i ++) {
        var x = canvas.width/2 + ((i%5)-2)*h100*18;
        var y = 48*h100 + h100*18*Math.floor(i/5);
        //display the actual ball
        sadBallDisplay(inventory[i], x, y);

        spaghettiDragging(inventory, x, y, i, true);
    }

    if(equipScreen.currDragging) {
        sadBallDisplay(equipScreen.currDragging, mouse.x, mouse.y);
        if(!mouse.pressed) {
            soundEffects.equipPlace.play();
            if(IsPointInAABB(mouse, {x: h100 * 2, y: 13*h100}, {x: h100 * 96, y: 20*h100}) && equip.length < 5) {
                equip.push(equipScreen.currDragging);
            }
            else {
                inventory.push(equipScreen.currDragging);
            }
            equipScreen.currDragging = false;
        }
    }

    //next button
    /*
    var hovered = IsPointInAABB(mouse, {x: h100 * 80, y: 2*h100}, {x: h100 * 18, y: 9*h100});
    ctx.fillStyle = hovered? mouse.pressed? "rgb(180, 180, 0)": "rgb(200, 200, 0)": "rgb(238, 255, 0)";
    ctx.strokeStyle = "black";
    rect(ctx, h100 * 80, 2*h100, h100 * 18, 9*h100, true, true);

    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = 4*h100 + "px pixelFont";
    ctx.fillText("To Lv. " + (currLevel+1) + "!", h100 * 89, 7*h100);
    */
    
    equipScreen.button.go();
    if(equipScreen.button.pressed && equip.length > 0) {
        switchState("playing");
    }
};
equipScreen.currDragging = false;
equipScreen.button = new Button(h100 * 66, 2*h100, h100 * 32, 9*h100, "placeholder", "rgb(173, 185, 4)");