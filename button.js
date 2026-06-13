var createButton = function(x,y,w,h,txt,pressFunc) {
    return {
        p: {x: x, y: y},
        s: {x: w, y: h},
        txt: txt,
        pressFunc: pressFunc,
        go: function() {
            stroke(0);
            strokeWeight(3);
            var hovered = mouse.x > this.p.x &&
                    mouse.x < this.p.x+this.s.x &&
                    mouse.y > this.p.y &&
                    mouse.y < this.p.y+this.s.y;
            fill(hovered? mouse.pressed? color(100, 100, 100): color(120, 120, 120): color(150, 150, 150));
            rect(this.p.x, this.p.y, this.s.x, this.s.y);
            fill(255);
            textAlign(CENTER, CENTER);
            textSize(this.s.y * 2/3);
            text(this.txt, this.p.x+this.s.x/2, this.p.y+this.s.y/2);
            
            if(hovered && mouse.justPressed) {
                this.pressFunc();
            }
        }
    };
};
class Button {
    constructor(x,y,w,h,txt,col) {
        this.p = new Vect(x, y);
        this.s = new Vect(w, h);
        this.txt = txt;
        this.baseCol = col/* || "rgb(150, 150, 150)"*/ || "#4A90E2";
    }

    go() {
        ctx.strokeStyle = "black";
        ctx.lineWidth = h100/4;
        var hovered = mouse.x > this.p.x &&
                mouse.x < this.p.x+this.s.x &&
                mouse.y > this.p.y &&
                mouse.y < this.p.y+this.s.y;
        ctx.fillStyle = this.baseCol;
        rect(ctx, this.p.x, this.p.y, this.s.x, this.s.y, true, true);

        var shadow = "rgba(0,0,0,0.2)";
        var highlight = "rgba(255,255,255,0.2)";
        var borderWidth = h100;
        ctx.fillStyle = hovered? shadow: highlight;
        ctx.beginPath();
        ctx.rect(this.p.x, this.p.y, this.s.x, borderWidth);
        ctx.rect(this.p.x, this.p.y, borderWidth, this.s.y);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = hovered? highlight: shadow;
        ctx.beginPath();
        ctx.rect(this.p.x+this.s.x-borderWidth, this.p.y + borderWidth, borderWidth, this.s.y-borderWidth);
        ctx.rect(this.p.x + borderWidth, this.p.y+this.s.y-borderWidth, this.s.x-borderWidth, borderWidth);
        ctx.closePath();
        ctx.fill();

        /*
        //draw a rectangle over it
        ctx.fillStyle = `rgba(0,0,0,${hovered? mouse.pressed? 0.2: 0.1: 0})`;
        ctx.fillRect(this.p.x, this.p.y, this.s.x, this.s.y);
        */
        
        //text
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = this.s.y + "px pixelFont";
        var offset = hovered * borderWidth / 2;

        ctx.fillStyle = "black";
        ctx.fillText(this.txt, this.p.x+this.s.x/2+offset + h100/5, this.p.y+this.s.y*0.55+offset + h100/3);
        ctx.fillStyle = "white";
        ctx.fillText(this.txt, this.p.x+this.s.x/2+offset, this.p.y+this.s.y*0.55+offset);
    }

    get pressed() {
        if(mouse.justPressed) {
            return mouse.x > this.p.x &&
                mouse.x < this.p.x+this.s.x &&
                mouse.y > this.p.y &&
                mouse.y < this.p.y+this.s.y;
        }
        return false;
    }
}