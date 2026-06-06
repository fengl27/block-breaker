//mouse shenanigan
var mouse = {
    pressed: false,
    x: 0,
    y: 0,
    justPressed: false
};
function handleMousePress(e) {
    mouse.pressed = true;
    mouse.justPressed = true;
}
function handleMouseMove(e) {
    mouse.x = e.clientX - canvas.offsetLeft;
    mouse.y = e.clientY - canvas.offsetTop;
}
function handleMouseRelease(e) {
    mouse.pressed = false;
    mouse.justReleased = true;
}
canvas.addEventListener("mousedown", handleMousePress   );
canvas.addEventListener("mousemove", handleMouseMove    );
canvas.addEventListener("mouseup",   handleMouseRelease );

//hash function for setseed for um testing
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

//var seed = 150;//setseed
var seed = (Math.random()*2**32)>>>0;
const getRand = mulberry32(seed)


//very yes functions
var distRectToPoint = function(tl, br, p) {
    var x = Math.min(br.x, Math.max(tl.x, p.x));
    var y = Math.min(br.y, Math.max(tl.y, p.y));

    var dx = x - p.x,
        dy = y - p.y;

    return [Math.sqrt(dx * dx + dy * dy), new Vect(x, y)];
};
var sqrDistRectToPoint = function(tl, br, p) {
    var x = Math.min(br.x, Math.max(tl.x, p.x));
    var y = Math.min(br.y, Math.max(tl.y, p.y));

    var dx = x - p.x,
        dy = y - p.y;

    return [dx * dx + dy * dy, new Vect(x, y)];
};
var IsPointInAABB = function(point, pos, size) {
    return point.x > pos.x && point.x < pos.x + size.x &&
            point.y > pos.y && point.y < pos.y + size.y;
};
var AABBCollide = function(p1, s1, p2, s2) {
    //no i didn't take this from the internet i logicked this into existance
    return p1.x + s1.x > p2.x && p1.x < p2.x + s2.x && p1.y + s1.y > p2.y && p1.y < p2.y + s2.y;
}
var fillArr = function([r, g, b]) {
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;//waoooo
}
var limit = function(n, minV, maxV) {//limits float between a max and min
    return Math.max(Math.min(n, maxV), minV);
}
var lerp = function(a, b, t) {
    return a + (b - a) * t;
}
var dist = function(x, y, x2, y2) {
    return Math.sqrt((x - x2) * (x - x2) + (y - y2) * (y - y2));
}
var lerpArr = function(a, b, t) {
    var out = [];
    for(var i = 0; i < a.length; i ++) {
        out.push(lerp(a[i], b[i], t));
    }
    return out;
};
var chooseWithWeighting = function(arr) {
    var rand = getRand();
    for(var i = 0; i < arr.length; i ++) {
        rand -= arr[i][1];
        if(rand <= 0) {
            return arr[i][0];
        }
    }
}

//i like stealing (https://stackoverflow.com/questions/66123016/interpolate-between-two-colours-based-on-a-percentage-value)
function hsvToRgb(h, s, v) {
    let r, g, b;
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}
function lerpHsv(color1, color2, t) {//hsv goes from 0-1 because funny
    if(!color1 || !color2) {
        return "black";
    }
    let h1 = color1.h;
    let h2 = color2.h;
    
    // Shortest path for hue interpolation
    let hueDiff = h2 - h1;
    if (hueDiff > 0.5) hueDiff -= 1;
    if (hueDiff < -0.5) hueDiff += 1;
    
    let h = h1 + hueDiff * t;
    // Ensure hue stays in [0, 1) range
    if (h < 0) h += 1;
    if (h >= 1) h -= 1;

    let s = color1.s + t * (color2.s - color1.s);
    let v = color1.v + t * (color2.v - color1.v);

    //var {r, g, b} = hsvToRgb(h, s, v);

    return {h, s, v};
}

function drawImgWithHue(img, hue, rect, shouldReturn) {//rect is an array with x,y,w,h
    var bob = new OffscreenCanvas(rect[2], rect[3]);
    var bctx = bob.getContext("2d");
    bctx.imageSmoothingEnabled = false;//make my sad pixel art less sad (it still suck)

    // 1. Draw original image
    bctx.drawImage(img, 0, 0, rect[2], rect[3]);

    // 2. just draw over it idk at this point
    bctx.globalCompositeOperation = 'source-atop';
    bctx.fillStyle = `hsl(${hue}, 100%, 50%)`; // Target hue
    bctx.fillRect(0, 0, rect[2], rect[3]);

    //do shenanigans to make it like the same luminosity-ish
    bctx.globalCompositeOperation = 'luminosity';
    bctx.drawImage(img, 0, 0, rect[2], rect[3]);
    
    bctx.globalCompositeOperation = 'screen';
    bctx.fillStyle = `hsl(${hue}, 100%, 20%)`; // Target hue
    bctx.fillRect(0, 0, rect[2], rect[3]);
    
    
    bctx.globalCompositeOperation = 'destination-in';
    bctx.drawImage(img, 0, 0, rect[2], rect[3]);

    if(shouldReturn) {
        return [bob, bctx];
    }
    else {
        ctx.drawImage(bob, rect[0], rect[1]);
    }
}
function drawImgWithCol(img, col, rect) {
    var bob = new OffscreenCanvas(rect[2], rect[3]);
    var bctx = bob.getContext("2d");
    bctx.imageSmoothingEnabled = false;//make my sad pixel art less sad (it still suck)
    
    //draw img
    bctx.drawImage(img, 0, 0, rect[2], rect[3]);

    //use source-atop to set wherever the image exists to col (and delete original)
    bctx.globalCompositeOperation = "source-in";
    bctx.fillStyle = col; // Target hue
    bctx.fillRect(0, 0, rect[2], rect[3]);
    
    //draw onto canvas at wanted position
    ctx.drawImage(bob, rect[0], rect[1]);
}

//display functions
var rect = function(ctx, x, y, w, h, fill, stroke) {
    /*
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    if(fill)    ctx.fill();
    if(stroke)  ctx.stroke();
    ctx.closePath();
    */
    if(fill)     ctx.fillRect(x,y,w,h);
    if(stroke) ctx.strokeRect(x,y,w,h);
}
var circle = function(ctx, x, y, s) {
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.closePath();
};
var triangle = function(ctx, x, y, x2, y2, x3, y3) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
};
var displayBall = function(type, x, y, size) {
    size *= 2;
    ctx.drawImage(assets.balls, 8* ["fire", "virus", "barrier", "ghost", "weaken", "normal", "angry-ghost"].indexOf(type), 0, 8, 8, x-size/2, y-size/2, size, size);
};
var drawHeart = function(ctx, x, y, s) {
    ctx.fillStyle = "rgb(197, 51, 51)";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    
    for(var r = Math.PI; r < 2.2 * Math.PI; r += 0.1) {
        ctx.lineTo(25 + 25 * Math.cos(r), 25 * Math.sin(r) - 10);
    }
    ctx.lineTo(0, 60);
    for(var r = 2.2 * Math.PI; r >= Math.PI; r -= 0.1) {
        ctx.lineTo(-25 - 25 * Math.cos(r), 25 * Math.sin(r) - 10);
    }

    ctx.fill();
    ctx.stroke();
    ctx.restore();
}
//easing functions (https://easings.net)
var easings = {
    easeOutQuad: (x) => {
        return 1 - (1 - x) * (1 - x);
    },
    easeInQuart: (x) => {
        return x * x * x * x;
    },
    easeInOutQuad: (x) => {
        return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    },
    easeOutBack: (x) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;

        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }
};
//cool lookin' circles
class CoolCircle {
    constructor(size, tailLength, col) {
        this.tLength = tailLength;
        this.size = size;
        this.prevPos = [];
        this.col = col;
    }
    display(ctx, x, y) {
        //prevent depression bugs on first frame
        if (this.prevPos.length === 0) {
            this.prevPos.push({ x, y });
        }
        //draw the fancy tail triangle
        var lastPos = this.prevPos[this.prevPos.length - 1];
        var vel = {
            x: x - lastPos.x,
            y: y - lastPos.y
        };
        var rotated = {
            x: vel.y,
            y: -vel.x
        };
        var mag = Math.sqrt(rotated.x * rotated.x + rotated.y * rotated.y);
        rotated.x *= this.size / 2 / mag;
        rotated.y *= this.size / 2 / mag;
        ctx.fillStyle = "rgba(150, 150, 150, 0.95)";
        triangle(
            ctx,
            x + rotated.x, y + rotated.y,
            x - rotated.x, y - rotated.y,
            this.prevPos[0].x, this.prevPos[0].y
        );
        ctx.fill();
        //update prevPos list
        this.prevPos.push({ x, y });
        if (this.prevPos.length > this.tLength) {
            this.prevPos.splice(0, 1);
        }
        //draw the circle
        ctx.fillStyle = this.col;
        circle(ctx, x, y, this.size);
        ctx.fill();
    }
}

var keys = {};
var justPressed = {};
keys.handleKeyDown = function(e) {
    //console.log("pressed " + e.key.toLowerCase());
    var k = e.key.toLowerCase();
    if(!keys[k]) {
        keys[k] = true;
        justPressed[k] = true;
    }
};
keys.handleKeyUp = function(e) {
    var k = e.key.toLowerCase();
    keys[k] = false;
};
document.body.addEventListener("keydown", keys.handleKeyDown);
document.body.addEventListener("keyup", keys.handleKeyUp);