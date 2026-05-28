var screenshake = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    shake(mag, dx, dy) {
        mag *= settings.screenshakeMult;
        var dir = arguments.length !== 1? Math.atan2(dy, dx): Math.random() * Math.PI * 2;
        this.vx += Math.cos(dir) * mag;
        this.vy += Math.sin(dir) * mag;
    },
    update: function() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.85;
        this.vy *= 0.85;
        this.vx -= this.x / 10;
        this.vy -= this.y / 10;
    }
};