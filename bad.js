class Bad {
    static SPEED = settings.badSpeed

    constructor(x, y, func) {
        this.pos = new Vect(x, y);
        this.func = func;
    }

    display() {
        ctx.fillStyle = "rgb(136, 0, 0)";
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;

        circle(ctx, this.pos.x, this.pos.y, Ball.BALL_SIZE);
        ctx.fill();
        ctx.stroke();
    }

    update() {
        this.pos.y += Bad.SPEED;

        //paddle collision
        var dst = distRectToPoint(paddle.pos, Vect.add(paddle.pos, paddle.size), this.pos);
        if(dst[0] < Ball.BALL_SIZE) {
            this.func();
            this.dead = true;
        }
        else if(this.pos.y > canvas.height + Ball.BALL_SIZE) {
            //die
            this.dead = true;
        }
    }
}
class Good extends Bad {//laziness and not knowing what to name the file
    display() {
        ctx.fillStyle = "green";
        ctx.strokeStyle = "rgba(0, 117, 8, 1)";
        ctx.lineWidth = 3;

        var width = Ball.BALL_SIZE / 4;
        var height = Ball.BALL_SIZE;
        ctx.translate(this.pos.x, this.pos.y);
        ctx.beginPath();//I don't know how to draw a cross good so here ya go
        ctx.moveTo(width, width);
        ctx.lineTo(width, height);
        ctx.lineTo(-width, height);
        ctx.lineTo(-width, width);
        ctx.lineTo(-height, width);
        ctx.lineTo(-height, -width);
        ctx.lineTo(-width, -width);
        ctx.lineTo(-width, -height);
        ctx.lineTo(width, -height);
        ctx.lineTo(width, -width);
        ctx.lineTo(height, -width);
        ctx.lineTo(height, width);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.resetTransform();
    }
}