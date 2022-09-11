const canvas = document.getElementById('c');
canvas.width = 700;
canvas.height = 700;
const c = canvas.getContext('2d');

// Data:
const gravity = 0;
const lossyPercentage = 0.99;
const airResistance = 0.5; 
const min = 0.1;
const strikePower = 3;
const width = 10//canvas.width/scale;
const height = 10//canvas.width/scale;
const scale = canvas.width/width;

var timeSinceCall = 0;
var timeSinceFrame = 0;  
const framesPerSecond = 60;
const speedDecayRate = airResistance**(1/framesPerSecond);

var strikeVector = {x: 0, y:0}
var golfBall = new Ball({x:width/2, y:height/2}, new Vector2D(0, 0), 0.3, 'white')
var board = [];
board.length = 110;
board = [
    [1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,1,0,0,0,0,1,0,0],
    [0,0,1,0,0,0,0,1,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,1,0,0,0,0,1,0,0],
    [0,0,1,0,0,0,0,1,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1]
];
// for (let row = 0; row < height; row++) {
//     board[row] = [];
//     for (let col = 0; col < width; col++) {
//         board[row][col] = Math.floor(Math.random()*10);
//         board[row][col] = board[row][col] > 1 ? 0 : 1;
//     }
// }
// Data:

function distanceSquared(pos1, pos2) {
    return (pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2
} 

function main(time = 0) {
    let elapsedTime = (time-timeSinceCall)/1000;
    timeSinceFrame += elapsedTime
    if (timeSinceFrame >= 1/framesPerSecond) {
        timeSinceFrame = 0;
        c.fillStyle = 'green'
        c.fillRect(0, 0, canvas.width, canvas.height);

        c.fillStyle = 'black'
        let k = 0;
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                //if (board[row][col] != 0) {
                    switch (board[row][col]) {
                        case 0: c.fillStyle = (row%2 + col%2)%2 == 0 ? '#7CB342' : '#8BC34A'; break;
                        case 1: c.fillStyle = 'black'; break
                        case 2: c.fillStyle = 'yellow'; break
                    }
                    c.fillRect(col*scale, canvas.width- (row+1)*scale,scale,scale)
                //}
                
                k++
            }
        }

        golfBall.updatePosition(1/framesPerSecond);
        golfBall.draw();
    }
    timeSinceCall = time;
    window.requestAnimationFrame(main);
}
main();

canvas.addEventListener('mousedown', e => {
    const box = canvas.getBoundingClientRect();
    const x = e.x - box.left;
    const y = e.y - box.top;
    console.log(x, y)
    strikeVector.x = x;
    strikeVector.y = y;
});
canvas.addEventListener('mouseup', e => {
    const box = canvas.getBoundingClientRect();
    const x = e.x - box.left;
    const y = e.y - box.top;
    strikeVector.x = x - strikeVector.x;
    strikeVector.y = y - strikeVector.y;
    golfBall.vel.x -= strikeVector.x*strikePower/scale;
    golfBall.vel.y += strikeVector.y*strikePower/scale;


})
