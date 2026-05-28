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
        this.baseCol = col || "rgb(150, 150, 150)";
    }

    go() {
        ctx.strokeStyle = "black"
        ctx.lineWidth = h100/2;
        var hovered = mouse.x > this.p.x &&
                mouse.x < this.p.x+this.s.x &&
                mouse.y > this.p.y &&
                mouse.y < this.p.y+this.s.y;
        ctx.fillStyle = this.baseCol;
        rect(ctx, this.p.x, this.p.y, this.s.x, this.s.y, true, true);
        //draw a rectangle over it
        ctx.fillStyle = `rgba(0,0,0,${hovered? mouse.pressed? 0.2: 0.1: 0})`;
        ctx.fillRect(this.p.x, this.p.y, this.s.x, this.s.y);
        

        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = this.s.y*2/3 + "px Tahoma";
        ctx.fillText(this.txt, this.p.x+this.s.x/2, this.p.y+this.s.y/2);
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