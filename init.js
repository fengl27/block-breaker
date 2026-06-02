const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

ctx.imageSmoothingEnabled = false;

const h100 = canvas.height / 100;
const settings = {
    //brick stuff
    brickSpeed: h100 * 0.01, //fall speed
    targetBrickSpeed: h100 * 0.02,
    brickAcc: h100 * 0.002 / 120,

    brickGridSize: new Vect(7, 4),
    brickSize: new Vect(0, 0),
    brickMargin: /*canvas.width / 200*/ 0,

    brickDisplayMargin: h100/4,

    //ball stuff
    ballSize: canvas.height / 60, //radius
    ballStartSpeed: canvas.height / 80,
    DT: 4,//4 updates per update

    //paddle stuff
    paddleSize: new Vect(canvas.height / 5, canvas.height / 30),
    paddleAcc: h100 * 0.8,
    paddleFric: 0.7,//friction
    
    //other
    badSpeed: h100/2,
    screenshakeMult: h100 * 0.25,

    sfxVolMult: 0.5,
};

//set things
settings.brickSize.x = canvas.width / settings.brickGridSize.x - settings.brickMargin;
settings.brickSize.y = settings.brickSize.x / 2;

//ball upgrade things
//LA GAME STATE FOR STAT MACHINEINE
var gameState = "mainMenu";
var paused = false;

//assets lol
var assets = {
    brick: "red-brick.png",
    brickOutline: "brick-outline.png",
    balls: "kais-balls.png",
    paddle: "paddle.png"
};
for(var i in assets) {
    let bob = new Image();
    bob.src = "assets/"+assets[i];
    assets[i] = bob;
}