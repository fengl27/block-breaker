var bricks = [];
var brickTypes = [];

var healthCols = [
    {h: 0.1, s: 1, v: 1},//dead
    {h: 0.6, s: 1, v: 1},
    {h: 0.7, s: 1, v: 1},
    {h: 0.8, s: 1, v: 1},
    {h: 0.9, s: 1, v: 1},
    {h: 0.7, s: 0.5, v: 1},
    {h: 0, s: 1, v: 1},
    {h: 0, s: 1, v: 1},
    {h: 0, s: 1, v: 1},
];
var getBrickCol = function(health) {
    var thing = (health - 1) / 10;
    var lerpVal = thing % 1;
    return lerpHsv(
        healthCols[Math.floor(thing)],
        healthCols[Math.ceil(thing)],
        lerpVal
    );
};

var offsetY = 0;
var tileOffset = 0;

var damageTickTimer = 0;

var levelLength = 5;
var levelLeft = levelLength;
//var currLevel = 0;//on level 0
var currLevel = 0;
var levelThings = [//brickhealth, speed, level length
    /*
    [1,     h100*0.000,     3],
    [2,     h100*0.010,     4],
    */
    [1,     h100*0.010,     2],
    [1,     h100*0.011,     6],
    [2,     h100*0.010,     4],
    [2,     h100*0.012,     5],
    [2,     h100*0.012,     7],
    [3,     h100*0.015,     8],
    [3,     h100*0.020,     10],
    [4,     h100*0.023,     10],
    [4,     h100*0.025,     15],
    [5,     h100*0.027,     16],
    [6,     h100*0.028,     17],
    [8,     h100*0.029,     18],
    [10,    h100*0.030,     19],
    [13,    h100*0.031,     20],
    [16,    h100*0.032,     22],
    [19,    h100*0.033,     24],
    [22,    h100*0.034,     25],
    [25,    h100*0.035,     30],
    [100,    h100*0.5,     1],
];

class Brick {
    static BRICK_SPEED = levelThings[currLevel][1] //fall speed

    static BRICK_GRID_SIZE = settings.brickGridSize
    static BRICK_SIZE = settings.brickSize
    static BRICK_MARGIN = settings.brickMargin
    static BRICK_DISPLAY_MARGIN = settings.brickDisplayMargin

    static particle = function(x, y, o) {
        //white
        Particle.squareParticle(x, y, o, "255, 255, 255");
    }

    static spawnBricks = function() {
        var marginSize = Brick.BRICK_SIZE.y + Brick.BRICK_MARGIN;
        var brickStartX = canvas.width / 2 - marginSize * Brick.BRICK_GRID_SIZE.x / 2;
        
        var brickStartY = Brick.BRICK_MARGIN;
        for(var y = 0; y < Brick.BRICK_GRID_SIZE.y; y ++) {
            var realY = brickStartY + y * marginSize;
            Brick.spawnBrickRow(realY, y);
            if(levelLeft <= 0) {
                break;
            }
        }
    }

    static spawnBrickRow = function(y, yidx) {
        levelLeft --;
        if(levelLeft < 0) return;
        var marginSize = Brick.BRICK_SIZE.x + Brick.BRICK_MARGIN;
        var brickStartX = canvas.width / 2 - marginSize * Brick.BRICK_GRID_SIZE.x / 2;
        for(var x = 0; x < Brick.BRICK_GRID_SIZE.x; x ++) {
            var realX = brickStartX + x * marginSize + Brick.BRICK_MARGIN / 2;
            var type = chooseWithWeighting(brickTypes);
            bricks.push(new type(realX, y, x, yidx));
        }
    }

    static findNeighbors(brick) {
        var bp = brick.tilePos;
        var out = [];
        for(var i = 0; i < bricks.length; i ++) {
            var bp2 = bricks[i].tilePos;
            if(Math.abs(bp2.x - bp.x) + Math.abs(bp2.y - bp.y) === 1) {
                out.push(bricks[i]);
            }
        }
        return out;
    }

    static runDamageTick() {
        //damage ticks happen every half second, i think
        for(var i = 0; i < bricks.length; i ++) {
            bricks[i].damageTick();
        }
    }

    constructor(x, y, tx, ty) {
        this.pos = new Vect(x, y);
        this.tilePos = new Vect(tx, ty);

        //this.health = 50;
        this.health = levelThings[currLevel][0] * (getRand() < 0.15? getRand() < 0.3? 4: 2: 1);

        this.effects = {
            onFire: 0,
            weakening: 0,
            dmgMult: 1,//damage multiplier
        };

        this.knockback = {//funny dopamine display effect
            offset: new Vect(0, 0),
            vel: new Vect(0, 0)
        };

        this.tint = [0, 0, 0, 0];
        this.saturationTint = Math.random() * 0.2;

        this.nextEffects = [];//for updating
    }

    get dead() {
        return this.health <= 0;
    }

    get center() {
        return Vect.add(this.pos, Vect.div(Brick.BRICK_SIZE, 2));
    }

    display() {
        if(this.health <= 0) {
            return;//don't display (it breaks things if you do)
        }
        if(!this.nextEffects.length && this.effects.onFire) this.effects.onFire=0;
        if(this.effects.onFire !== 40 && this.effects.onFire > 10) {
            /*
            ctx.strokeStyle = "rgb(255, 25, 0)";
            ctx.lineWidth = h100 / 2;
            ctx.strokeRect(this.pos.x, this.pos.y, Brick.BRICK_SIZE.x, Brick.BRICK_SIZE.y);
            */
            this.tint = [255, 0, 0, 0.5];
        }
        else if(this.effects.dmgMult > 1) {
            /*
            ctx.strokeStyle = "rgb(14, 150, 30)";
            ctx.lineWidth = h100 / 2;
            ctx.strokeRect(this.pos.x, this.pos.y, Brick.BRICK_SIZE.x, Brick.BRICK_SIZE.y);
            */
            this.tint = [14, 150, 30, 0.2];
            if(Math.random() < 0.1) {
                Particle.AABBParticles(
                    1, (x, y, o) => {
                        Particle.squareParticle(x, y, o, "14, 150, 30");
                    },
                    this.pos, Brick.BRICK_SIZE
                );
            }
        }

        var m = Brick.BRICK_DISPLAY_MARGIN;
        /*
        ctx.fillStyle = getBrickCol(this.health);
        ctx.fillRect(this.pos.x + m, this.pos.y + m, Brick.BRICK_SIZE.x - 2 * m, Brick.BRICK_SIZE.y - 2 * m);
        //ctx.rect(this.pos.x + m, this.pos.y + m, Brick.BRICK_SIZE.x - 2 * m, Brick.BRICK_SIZE.y - 2 * m);
        */
        var brickCol = getBrickCol(this.health);
        var dispRect = [this.pos.x + m + this.knockback.offset.x, this.pos.y + m + this.knockback.offset.y, Brick.BRICK_SIZE.x - 2 * m, Brick.BRICK_SIZE.y - 2 * m];
        
        
        // Draw image with tint
        var [bob, bctx] = drawImgWithHue(assets.brick, brickCol.h*360, dispRect, true);
        //tint
        bctx.fillStyle = `rgba(${this.tint.join(", ")})`;
        bctx.globalCompositeOperation = "source-atop";
        bctx.fillRect(...dispRect);

        ctx.drawImage(bob, dispRect[0], dispRect[1]);

        //sat tint (darkens slightly randomly)
        ctx.fillStyle = "rgba(0,0,0," + this.saturationTint + ")";
        ctx.fillRect(...dispRect);

        var epsilon = 0.00001;
        dispRect[0]-=epsilon; dispRect[1]-=epsilon; dispRect[2]+=2*epsilon; dispRect[3]+=2*epsilon;
        //draw outline normally
        ctx.drawImage(assets.brickOutline, ...dispRect);
        //tint the outline with desired tint
        drawImgWithCol(assets.brickOutline, `rgba(${this.tint[0]}, ${this.tint[1]}, ${this.tint[2]}, ${Math.min(this.tint[3]*3,1)})`, dispRect);


        //ctx.rect(this.pos.x + m, this.pos.y + m, Brick.BRICK_SIZE.x - 2 * m, Brick.BRICK_SIZE.y - 2 * m);

        this.tint[3] *= 0.95;
        /*
        ctx.fillStyle = "black";
        ctx.font = "50px Arial";
        ctx.fillText(this.effects.onFire, this.pos.x, this.pos.y + Brick.BRICK_SIZE.y);
        */

        if(keys.w && mouse.pressed && IsPointInAABB(mouse, this.pos, Brick.BRICK_SIZE)) {
            
            this.effects.dmgMult = 2;
        }
    }

    update() {
        if(this.pos.y > canvas.height - Brick.BRICK_SIZE.y) {
            //well then ya dead y'nkow??
            switchState("lose");
        }

        //run kb effect
        this.knockback.offset.add(this.knockback.vel);
        this.knockback.vel.mult(0.85);
        this.knockback.vel.add(Vect.div(this.knockback.offset, -20));
    }

    damage(amount, noShake, noSound, damageOrigin) {
        amount = amount || 1;
        this.health -= amount * this.effects.dmgMult;
        if(!noShake) {
            screenshake.shake(amount * this.effects.dmgMult);
        }
        if(this.dead && !noSound) {
            soundEffects.kill.play();
            return;
        }

        //do knockback effect
        var diff;
        if(damageOrigin) {
            diff = Vect.sub(this.center, damageOrigin);
        }
        else {
            diff = new Vect(Math.random() - 0.5, Math.random() - 0.5);
        }
        diff.mult(amount * h100 / 2 / diff.mag());//scale based on dmg
        this.knockback.vel.add(diff);
    }

    static runFire(dude, spread) {
        if(dude.effects.onFire === 40) {
            dude.damage(1, true, true, false);//do 1 damage without shake because fire is pain
            soundEffects.fire.play();
            if(spread > 0) {
                var neighbors = Brick.findNeighbors(dude);
                for(var i = 0; i < neighbors.length; i ++) {
                    if(!neighbors[i].effects.onFire) {
                        neighbors[i].effects.onFire = 40;
                        neighbors[i].nextEffects.push([30, (dude, idx) => {
                            return Brick.runFire(dude, spread - 1);
                        }]);
                    }
                }
            }
            
            Particle.AABBParticles(
                spread + 1, (x, y, o) => {
                    Particle.squareParticle(x, y, o, "255, 0, 0");
                },
                dude.pos, Brick.BRICK_SIZE
            );
            
        }
        dude.effects.onFire --;
        return dude.effects.onFire <= 0;
    }

    static runWeaken(dude, spread, weakenAmt, die) {
        dude.effects.dmgMult = weakenAmt;
        //dude.dmgMult = weakenAmt;
        if(dude.effects.weakening === 20) {
            if(spread > 0) {
                var neighbors = Brick.findNeighbors(dude);
                for(var i = 0; i < neighbors.length; i ++) {
                    if(!neighbors[i].effects.weakening) {
                        neighbors[i].effects.weakening = 20;
                        neighbors[i].nextEffects.push([5, (dude, idx) => {
                            return Brick.runWeaken(dude, spread - 1, weakenAmt);
                        }]);
                    }
                }
            }
            if(die) {
                dude.damage(1);
            }
        }
        dude.effects.weakening --;
        return dude.effects.weakening <= 0;
    }

    static runVirus(dude) {
        if(dude.effects.virusTimer <= 0) {
            dude.effects.virusTimer = 30;
            soundEffects.virus.play();
            dude.damage(dude.effects.virusDamage, true);//do damage
            screenshake.shake(dude.effects.virusDamage / 2);
            //console.log("took " + dude.effects.virusDamage + " dmg ");
            Particle.AABBParticles(
                dude.effects.virusDamage, (x, y, o) => {
                    Particle.squareParticle(x, y, o, "60, 0, 116");
                },
                dude.pos, Brick.BRICK_SIZE
            );
            if(dude.effects.virusDamage === 1) {
                return true;
            }
            dude.effects.virusDamage = Math.ceil(dude.effects.virusDamage / 2);
            /*
            if(dmg > 1) {
                let newDmg = Math.ceil(dmg / 2);
                dude.nextEffects.push([30, (dude, idx) => {
                    return Brick.runVirus(dude, newDmg);
                }]);
            }
            else {
                return true;
            }
            */
        }
        else {
            dude.effects.virusTimer --;
        }
    }

    damageTick() {
        /*
        if(this.nextEffects.length > 1) {
            console.log(this.tilePos + " something sussy");
        }
        */
        for(var i = 0; i < this.nextEffects.length; i ++) {
            this.nextEffects[i][0] --;//timer
            if(this.nextEffects[i][0] <= 0) {
                if(this.nextEffects[i][1](this, i)) {
                    //console.log("deleted thingy from " + this.tilePos);
                    this.nextEffects.splice(i, 1);
                    i --;
                }
            }
        }
    }
}

class HardBrick extends Brick {//2 hits to break

    static particle = function(x, y, o) {
        Particle.squareParticle(x, y, o, "128, 59, 6");//brown
    }

    constructor(x, y, tx, ty) {
        super(x, y, tx, ty);
        this.hits = 0;
    }
    display() {
        if(this.hits === 0) {
            ctx.fillStyle = "rgb(128, 59, 6)";
        }
        else {
            ctx.fillStyle = "rgba(148, 120, 112, 1)";
        }
        ctx.fillRect(this.pos.x, this.pos.y, Brick.BRICK_SIZE.x, Brick.BRICK_SIZE.y);
    }
    bonk() {
        this.hits ++;
        if(this.hits > 1) {
            Particle.spawnParticles(
                4, HardBrick.particle,
                this.pos.x + Brick.BRICK_SIZE.x / 2,
                this.pos.y + Brick.BRICK_SIZE.y / 2
            );
        }
        else {
            Particle.spawnParticles(
                2, HardBrick.particle,
                this.pos.x + Brick.BRICK_SIZE.x / 2,
                this.pos.y + Brick.BRICK_SIZE.y / 2
            );
        }
    }
}

brickTypes.push([Brick,             1   ]);
//brickTypes.push([HardBrick,         4   ]);
//make them add to 1
var sumWeight = 0;
for(var i = 0; i < brickTypes.length; i ++) {
    sumWeight += brickTypes[i][1];
}
for(var i = 0; i < brickTypes.length; i ++) {
    brickTypes[i][1] /= sumWeight;
}