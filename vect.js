class Vect {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    static get(v) {
        return new Vect(v.x, v.y);
    }
    static add(v1, v2) {
        return new Vect(v1.x + v2.x, v1.y + v2.y);
    }
    static sub(v1, v2) {
        return new Vect(v1.x - v2.x, v1.y - v2.y);
    }
    static mult(v1, s) {
        return new Vect(v1.x * s, v1.y * s);
    }
    static div(v1, s) {
        return new Vect(v1.x / s, v1.y / s);
    }
    static dist(v1, v2, x2, y2) {
        if(arguments.length === 2) {
            var x = v2.x - v1.x;
            var y = v2.y - v1.y;
            return Math.sqrt(x * x + y * y);
        }
        else {
            var dx = x2 - v1;
            var dy = y2 - v2;
            return Math.sqrt(dx * dx + dy * dy);
        }
    }
    static sqrDist(v1, v2) {
        var x = v2.x - v1.x;
        var y = v2.y - v1.y;
        return x * x + y * y;
    }
    static normalize(v) {
        var mag = v.mag();
        return Vect.div(v, mag);
    }
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
    add(vect, y) {
        if(arguments.length === 1) {
            this.x += vect.x;
            this.y += vect.y;
        }
        else {
            this.x += vect;
            this.y += y;
        }
    }
    sub(vect, y) {
        if(arguments.length === 1) {
            this.x -= vect.x;
            this.y -= vect.y;
        }
        else {
            this.x -= vect;
            this.y -= y;
        }
    }
    mult(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }
    div(scalar) {
        this.x /= scalar;
        this.y /= scalar;
    }
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize(){
        return this.div(this.mag());
    }
    toNormalized() {
        var mag = this.mag();
        this.x /= mag;
        this.y /= mag;
    }
    sqrMag() {
        return this.x * this.x + this.y * this.y;
    }
    copy() {
        return new Vect(this.x, this.y);
    }
    set(x, y) {
        if(arguments.length === 1) {
            this.x = x.x;
            this.y = x.y;
        }
        else {
            this.x = x;
            this.y = y;
        }
    }

    toString() {
        return "[" + this.x + ", " + this.y + "]";
    }
}
