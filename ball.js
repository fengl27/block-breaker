const ballTypes = {
    normal: {
        display: function() {
            ctx.save();
            ctx.translate(this.pos.x, this.pos.y);
            //ctx.rotate(Math.atan2(this.vel.y, this.vel.x));
            //ctx.scale(1.3, 1);
            ctx.beginPath();
            
            displayBall(this.type, 0, 0, Ball.BALL_SIZE);
            //circle(ctx, 0, 0, Ball.BALL_SIZE);
            ctx.fill();
            ctx.restore();
        },

        bonk: function(brick, ball, level) {
            //jaank
            brick.health /= brick.effects.dmgMult;
            var damage = Math.min(brick.health, Math.floor(ball.damageLeft));
            //console.log("do " + Math.max(1, damage)/brick.effects.dmgMult + " DAMAGE to brick with " + brick.health + " health");
            brick.damage(Math.max(1, damage)/brick.effects.dmgMult, true);//do at least 1 damage
            screenshake.shake(1, ball.vel.x, ball.vel.y);//shakescreen with cool directionality
            particles.push(new CircleParticle(ball.pos.x, ball.pos.y));
            Particle.spawnParticles(
                4, Brick.particle,
                brick.pos.x + Brick.BRICK_SIZE.x / 2,
                brick.pos.y + Brick.BRICK_SIZE.y / 2
            );
            if(damage === Math.floor(ball.damageLeft)) {
                ball.damageLeft = 0;
                ball.calculateCollision(brick);
                soundEffects.damage.play();
            }
            else {
                ball.damageLeft -= damage;
            }
            brick.health *= brick.effects.dmgMult;
            if(brick.health < 1 && !brick.dead) {
                //just set it to 1 idk
                brick.health = 1;
            }
        },
        update: function() {
            if(isNaN(this.damageLeft)) {
                this.damageLeft = this.level;
            }
            this.speedMult = Math.max(1, Math.log(this.damageLeft + 3) / Math.log(4));
            /*
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.moveTo(this.pos.x, this.pos.y);
            ctx.arc(this.pos.x, this.pos.y, Ball.BALL_SIZE*2, 0, this.damageLeft/this.level*Math.PI*2);
            ctx.lineTo(this.pos.x, this.pos.y);
            ctx.fill();
            
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "900 50px Arial";
            ctx.fillText(this.damageLeft, this.pos.x, this.pos.y);
            */
        },
        paddle: function() {
            this.damageLeft = this.level;
        }
    },
    virus: {
        display: function() {
            if(!this.dispRotation) {
                this.dispRotation = 0;
            }
            this.dispRotation += Math.sign(this.vel.x) / 8;
            ctx.save();
            ctx.translate(this.pos.x, this.pos.y);
            ctx.rotate(this.dispRotation);
            ctx.beginPath();
            displayBall(this.type, 0, 0, Ball.BALL_SIZE);
            //circle(ctx, 0, 0, Ball.BALL_SIZE);
            ctx.fill();
            ctx.restore();
        },
        bonk: function(brick, ball, level) {
            brick.effects.virusTimer = 0;
            brick.effects.virusDamage = 4 + 4 * level;
            brick.nextEffects.push([0, Brick.runVirus]);

            particles.push(new CircleParticle(ball.pos.x, ball.pos.y));

            ball.calculateCollision(brick);
        },
        update: function() {
            if(Math.random() < 0.05) {
                Particle.spawnParticles(2, (x, y, o) => {
                        ctx.fillStyle = `rgba(0, 0, 0, ${(o/2)})`;
                        ctx.beginPath();
                        ctx.arc(x, y, 5, 0, Math.PI * 2);
                        ctx.fill();
                }, this.pos.x, this.pos.y);
            }
        }
    },
    fire: {
        display: function() {
            if(!this.dispRotation) {
                this.dispRotation = 0;
            }
            this.dispRotation += Math.sign(this.vel.x) / 8;
            ctx.save();
            ctx.translate(this.pos.x, this.pos.y);
            ctx.rotate(Math.round(this.dispRotation*4/Math.PI)*Math.PI/4);
            ctx.beginPath();
            displayBall(this.type, 0, 0, Ball.BALL_SIZE);
            //circle(ctx, 0, 0, Ball.BALL_SIZE);
            ctx.fill();
            ctx.restore();
        },
        bonk: function(brick, ball, level) {
            particles.push(new CircleParticle(ball.pos.x, ball.pos.y));
            screenshake.shake(2, ball.vel.x, ball.vel.y);//shakescreen
            let spread = level;
            brick.effects.onFire = 40;
            brick.nextEffects = [];
            brick.nextEffects.push([0, (dude, idx) => {
                return Brick.runFire(dude, spread);
            }]);

            ball.calculateCollision(brick);
        }
    },
    ghost: {
        display: function() {
            ctx.save();
            ctx.translate(this.pos.x, this.pos.y);
            ctx.rotate(Math.atan2(this.vel.y, this.vel.x) + Math.PI / 2);
            ctx.beginPath();
            
            displayBall(this.vel.y < 0? "angry-ghost": this.type, 0, 0, Ball.BALL_SIZE);
            //circle(ctx, 0, 0, Ball.BALL_SIZE);
            ctx.fill();
            ctx.restore();
            if(this.vel.y < 0) {
                ctx.fillStyle = "rgba(170, 49, 49, 0.05)";
                for(var i = 1; i < 2.5; i += 0.3) {
                    ctx.beginPath();
                    ctx.arc(this.pos.x, this.pos.y, Ball.BALL_SIZE * i, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        },
        bonk: function(brick, ball, level) {
            if(ball.vel.y < 0 && brick.health > 1) {
                if(!ball.bricksHit.includes(brick)) {
                    soundEffects.ghost.play();
                    particles.push(new CircleParticle(ball.pos.x, ball.pos.y));
                    ball.bricksHit.push(brick);
                    brick.damage(Math.min(brick.health - 1, Math.pow(2, level-1)), true);
                    Particle.AABBParticles(
                        2,
                        (x, y, o) => {
                            Particle.squareParticle(x, y, o, "200, 200, 200");
                        },
                        brick.pos, Brick.BRICK_SIZE
                    );
                }
            }
        },

        update: function() {
            if(this.vel.y < 0) {
                /*
                ctx.fillStyle = "rgba(255, 100, 100, 0.1)";
                for(var i = 1; i < 3; i += 0.2) {
                    ctx.beginPath();
                    ctx.arc(this.pos.x, this.pos.y, Ball.BALL_SIZE * i, 0, Math.PI * 2);
                    ctx.fill();
                }
                */
                this.speedMult = 1.3;
            }
            else {
                this.speedMult = 1;
                this.bricksHit = [];//so that it doesn't just do infinite damage
            }
        }
    },
    barrier: {//blue guy
        //creates a one-use wall at the bottom as long as it's alive, can't use any walls
        display: function() {
            if(!this.dispRotation) {
                this.dispRotation = 0;
            }
            this.dispRotation += Math.sign(this.vel.x) / 8;
            ctx.save();
            ctx.translate(this.pos.x, this.pos.y);
            ctx.rotate(this.dispRotation);
            ctx.beginPath();
            displayBall(this.type, 0, 0, Ball.BALL_SIZE);
            //circle(ctx, 0, 0, Ball.BALL_SIZE);
            ctx.fill();
            ctx.restore();
        },
        bonk: function(brick, ball) {
            brick.damage(1, true);//do 1 damage
            soundEffects.damage.play();
            screenshake.shake(1, ball.vel.x, ball.vel.y);//shakescreen with cool directionality
            particles.push(new CircleParticle(ball.pos.x, ball.pos.y));
            Particle.AABBParticles(
                4, 
                (x, y, o) => {
                    Particle.squareParticle(x, y, o, "133, 220, 255");
                },
                brick.pos, Brick.BRICK_SIZE
            );

            ball.calculateCollision(brick);
        },
        update: function() {
            if(this.barrierCooldown == null) {
                this.barrierCooldown = 50;
                this.currCooldown = 0;
                this.barrierHealth = this.level;
                this.maxBarrierHealth = this.level;
            }
            var barrierY = canvas.height - h100 * 2.5;
            var deathTransparencyMult = limit((canvas.height - this.pos.y) / h100 / 20, 0, 0.5);
            var opacity = Math.max(1, this.barrierHealth) * deathTransparencyMult;
            if(this.currCooldown > 0) {
                this.currCooldown --;
                var t = 1 - this.currCooldown / this.barrierCooldown;
                if(t < 1/3) {
                    opacity = Math.min(opacity, (1 - easings.easeInQuart(t * 3)) / 2) * 2;
                    ctx.fillStyle = "rgba(255, 255, 255, " + opacity + ")";
                    ctx.fillRect(0, barrierY, canvas.width, canvas.height);
                }
                else if(t > 2/3) {
                    var thingT = easings.easeInQuart((t - 2/3) * 3);
                    var targetOpacity = deathTransparencyMult * (this.barrierHealth+1);
                    ctx.fillStyle = `rgba(109, 215, 255, ${thingT*targetOpacity}`;
                    ctx.fillRect(0, barrierY, canvas.width, canvas.height);
                }
                if(this.currCooldown <= 0) {
                    this.barrierHealth ++;
                    soundEffects.barrierRegen.play();
                    if(this.barrierHealth < this.maxBarrierHealth) {
                        this.currCooldown = this.barrierCooldown;
                    }
                    return;
                }
            }
            if(this.barrierHealth > 0) {
                ctx.fillStyle = `rgba(109, 214, 255, ${opacity})`;
                ctx.fillRect(0, barrierY, canvas.width, canvas.height);
                for(var i = 0; i < balls.length; i ++) {
                    if(balls[i].type !== this.type && balls[i].pos.y + Ball.BALL_SIZE > barrierY) {
                        balls[i].vel.y *= -1;
                        balls[i].pos.y = barrierY - Ball.BALL_SIZE;
                        if(ballTypes[balls[i].type].paddle) {
                            ballTypes[balls[i].type].paddle.call(balls[i]);
                        }
                        soundEffects.barrierRebound.play();
                        this.currCooldown = this.barrierCooldown;
                        this.barrierHealth --;
                        //break;
                    }
                }
            }
        }
    },
    weaken: {//funky slime guy
        display: function() {
            ctx.save();
            ctx.translate(this.pos.x, this.pos.y);
            ctx.rotate(Math.atan2(this.vel.y, this.vel.x)+Math.PI/2);
            ctx.scale(1, 1.2);
            ctx.beginPath();
            
            displayBall(this.type, 0, 0, Ball.BALL_SIZE);
            //circle(ctx, 0, 0, Ball.BALL_SIZE);
            ctx.fill();
            ctx.restore();
        },
        bonk: function(brick, ball, level) {
            //brick.damage(1, true);//do at least 1 damage
            brick.effects.dmgMult = Math.max(level+1, brick.effects.dmgMult);
            screenshake.shake(1, ball.vel.x, ball.vel.y);//shakescreen with cool directionality
            particles.push(new CircleParticle(ball.pos.x, ball.pos.y));

            let spread = 2;
            brick.effects.weakening = 20;
            brick.nextEffects = [];
            brick.nextEffects.push([0, (dude, idx) => {
                return Brick.runWeaken(dude, spread, level+1, true);
            }]);
            soundEffects.weaken.play();

            Particle.AABBParticles(
                4,
                (x, y, o) => {
                    Particle.squareParticle(x, y, o, "82, 171, 44");
                },
                brick.pos, Brick.BRICK_SIZE
            );
            ball.calculateCollision(brick);
        }
    },
};
/*
var equip = [
    "ghost",
    "fire",
    "barrier","barrier"
];
*/
var inventory = [];
var equip = [
    ["normal", 1]
];
class Ball {
    static BALL_SIZE = settings.ballSize
    static BALL_START_SPEED = settings.ballStartSpeed
    static DT = settings.DT//4 updates per update

    constructor(p, type, level) {
        this.pos = p;
        this.vel = new Vect(
            0,
            Ball.BALL_START_SPEED
        );

        this.airtime = 0;//time not touching paddle
        this.dead = false;
        
        this.type = type;
        this.level = level;

        this.spawnAnimTimer = 0;

        this.speedMult = 1;

        this.trailLength = 10;
        this.trail = [];
    }

    doSpawnAnim() {
        var size = easings.easeInQuart(this.spawnAnimTimer);
        
        //ctx.fillStyle = `rgba(255, 255, 255, ${size})`;
        displayBall(this.type, this.pos.x, this.pos.y, size * Ball.BALL_SIZE);
        //circle(ctx, this.pos.x, this.pos.y, size * Ball.BALL_SIZE);
        ctx.fill();
    }

    display() {
        if(this.spawnAnimTimer < 1) {
            this.doSpawnAnim();
            return;
        }

        //draw + update trail
        this.trail.splice(0, 0, {x: this.pos.x, y: this.pos.y});

        if(this.trail.length > this.trailLength) {
            this.trail.splice(this.trail.length - 1, 1);
        }

        ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
        for(var i = 1; i < this.trail.length; i ++) {
            for(var j = 0; j < 1; j += 0.1) {
                var lerpVal = 1 - (i + j) / this.trailLength;
                ctx.beginPath();
                var lx = lerp(this.trail[i - 1].x, this.trail[i].x, j);
                var ly = lerp(this.trail[i - 1].y, this.trail[i].y, j);
                circle(ctx, lx, ly, Ball.BALL_SIZE * lerpVal);
                ctx.fill();
            }
        }
        
        //display the actual ball
        //ctx.fillStyle = ballTypes[this.type].col;//fill;
        ballTypes[this.type].display.call(this);
        /*
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(Math.atan2(this.vel.y, this.vel.x));
        ctx.scale(1.2, 1);
        ctx.beginPath();
        circle(ctx, 0, 0, Ball.BALL_SIZE);
        ctx.clip();
        ctx.drawImage(assets.test, -Ball.BALL_SIZE, -Ball.BALL_SIZE, Ball.BALL_SIZE * 2, Ball.BALL_SIZE * 2);
        ctx.restore();
        */

        if(ballTypes[this.type].update) {
            ballTypes[this.type].update.call(this);
        }
    }

    calculateCollision(brick) {

        //more accurate physics
        var limit = 10;
        while(--limit > 0) {
            this.pos.sub(Vect.div(this.vel, Ball.DT * 10));
            if(sqrDistRectToPoint(brick.pos, Vect.add(brick.pos, Brick.BRICK_SIZE), this.pos) >= Ball.BALL_SIZE*Ball.BALL_SIZE) {
                break;
            }
        }
        //the accurate physics
        var dst = sqrDistRectToPoint(brick.pos, Vect.add(brick.pos, Brick.BRICK_SIZE), this.pos);

        var normal = Vect.sub(this.pos, dst[1]);
        normal.normalize();

        this.pos.set(Vect.add(dst[1], Vect.mult(normal, Ball.BALL_SIZE)));

        var velDot = Vect.mult(normal, -2 * Vect.dot(this.vel, normal));
        this.vel.add(velDot);
    }

    collideBrick(brick) {
        //bounding box collision
        if(
            brick.dead ||
            this.pos.x + Ball.BALL_SIZE < brick.pos.x ||
            this.pos.x - Ball.BALL_SIZE > brick.pos.x + Brick.BRICK_SIZE.x ||
            this.pos.y + Ball.BALL_SIZE < brick.pos.y ||
            this.pos.y - Ball.BALL_SIZE > brick.pos.y + Brick.BRICK_SIZE.y
        ) {
            return false;
        }
        //real collision
        var dst = sqrDistRectToPoint(brick.pos, Vect.add(brick.pos, Brick.BRICK_SIZE), this.pos);
        if(dst[0] < Ball.BALL_SIZE * Ball.BALL_SIZE) {
            ballTypes[this.type].bonk(brick, this, this.level);//we bonkin the brick
            /*
            var normal = Vect.sub(this.pos, dst[1]);
            normal.normalize();

            this.pos.set(Vect.add(dst[1], Vect.mult(normal, Ball.BALL_SIZE)));

            var velDot = Vect.mult(normal, -2 * Vect.dot(this.vel, normal));
            this.vel.add(velDot);
            */
            return true;
        }
        return false;
    }

    update(speedM) {
        speedM = speedM || 1;
        if(this.spawnAnimTimer < 1.5) {
            this.spawnAnimTimer += 0.05;
            return;
        }
        for(var i = 0; i < Ball.DT; i ++) {
            this.pos.add(Vect.div(this.vel, Ball.DT));
            //brick collision
            for(var j = 0; j < bricks.length; j ++) {
                if(!bricks[j].dead) {
                    if(this.collideBrick(bricks[j])) {
                        break;//prevent double collision jank of doom
                    }
                }
            }
        }
        this.airtime ++;
        if(this.airtime > 240) {
            this.vel.y += 0.003 * Ball.BALL_START_SPEED;
        }

        //normalize vel
        this.vel.normalize();
        this.vel.mult(Ball.BALL_START_SPEED * this.speedMult * speedM);
        this.trailLength = 10 / speedM;
        
        //paddle collision
        var dst = distRectToPoint(paddle.pos, Vect.add(paddle.pos, paddle.size), this.pos);
        if(dst[0] < Ball.BALL_SIZE && this.vel.y > 0) {
            soundEffects.bounce.play();
            if(ballTypes[this.type].paddle) {
                ballTypes[this.type].paddle.call(this);
            }

            //do the funny cycle
            //this.cycleMode = paddle.cycleMode;
            //paddle.cycleMode = (this.cycleMode + 1) % ballCycle.length;
            //paddle.col = ballTypes[ballCycle[paddle.cycleMode]].col;

            //switched to worse physics because it's cooler?
            this.airtime = 0;
            /*
            if(Math.abs(dst[1].x - this.pos.x) < 1) {//hit top
                
            }
            */
            //this.pos.y = paddle.pos.y - Ball.BALL_SIZE;

            //pong physics
            this.vel.x = (this.pos.x - (paddle.pos.x + paddle.size.x / 2) + paddle.vel.x) / paddle.size.x;
            this.vel.y = -0.25;

            //normalize the speed
            this.vel.normalize();
            this.vel.mult(Ball.BALL_START_SPEED);

            //screenshake
            screenshake.shake(1, 0, -1);
        }

        //wall collisions
        if(Math.abs(this.pos.x - canvas.width / 2) > canvas.width / 2 - Ball.BALL_SIZE) {
            this.pos.x = Math.sign(this.pos.x - canvas.width / 2) * (canvas.width / 2 - Ball.BALL_SIZE) + canvas.width / 2;
            this.vel.x *= -1;
            soundEffects.wallBounce.play();
        }
        if(this.pos.y < Ball.BALL_SIZE) {
            this.vel.y *= -1;
            this.pos.y = Ball.BALL_SIZE;
            soundEffects.wallBounce.play();
        }
        else if(this.pos.y > canvas.height + Ball.BALL_SIZE) {
            //die
            this.dead = true;
            soundEffects.ballDeath.play();
        }
    }
}
var balls = [];
var spawnBalls = function() {
    balls = [];
    var ballSpacing = Math.min(2.5 * Ball.BALL_SIZE, canvas.width / equip.length / 5);
    var ballStartX = canvas.width / 2 - ballSpacing * (equip.length - 1) / 2;
    for(var i = 0; i < equip.length; i ++) {
        balls.push(new Ball(new Vect(ballStartX + i * ballSpacing, canvas.height / 3), equip[i][0], equip[i][1]));
    }
}