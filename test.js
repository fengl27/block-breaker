var count = 0;
var frame = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    screenshake.update();
    canvas.style.transform = `translate(${screenshake.x}px, ${screenshake.y}px)`;
    count ++;
    if(count < 120) {
        drawHeart(ctx, canvas.width / 2, canvas.height / 2, h100/10);
    }
    else if(count === 120) {
        screenshake.shake(4);
        Particle.spawnParticles(10, (x, y, o) => {Particle.squareParticle(x, y, o, "rgb(255, 0, 0)")}, canvas.width / 2, canvas.height / 2);
    }
    Particle.runParticles();
    window.requestAnimationFrame(frame);
};
window.requestAnimationFrame(frame);