var paddle = {
    originalWidth: settings.paddleSize.x,
    size: settings.paddleSize,
    pos: new Vect(canvas.width / 2 - settings.paddleSize.x / 2, canvas.height * 0.95),
    vel: new Vect(),

    //cycleMode: 0,

    col: "white",
    
    tempSpeedMult: 1,
    speedMultDuration: 0,

    ACC: settings.paddleAcc,
    FRIC: settings.paddleFric,//friction

    get center() {
        return Vect.add(this.pos, Vect.div(this.size, 2));
    },
    
    display: function() {
        ctx.drawImage(assets.paddle, this.pos.x, this.pos.y, this.size.x, this.size.y);
        //ctx.fillStyle = this.col;
        //ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    },
    update: function() {
        if(this.speedMultDuration > 0) {
            this.speedMultDuration --;
            if(this.speedMultDuration <= 0) {
                this.tempSpeedMult = 1;//reset speed mult
            }
        }

        //this.col = interpolateColor(this.col, this.targetCol, 0.05);

        let movement = !!keys.d-!!keys.a;

        this.vel.x += this.tempSpeedMult * this.ACC * movement;
        this.vel.x *= this.FRIC;
        if(!movement) {
            this.vel.x *= 0.6;
        }
        this.pos.x += this.vel.x;

        this.pos.x = Math.max(0, Math.min(canvas.width - this.size.x, this.pos.x));

        var diff = Math.sign(this.originalWidth - this.size.x) * 0.1;
        this.size.x += diff;
        this.pos.x -= diff / 2;
    }
};