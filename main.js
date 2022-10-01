class Vector2D {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	add(vector) {
		this.x += vector.x;
		this.y += vector.y;
		return this;
	}
	subtract(vector, scale) {
		this.x -= vector.x * scale;
		this.y -= vector.y * scale;
	}
	multiply(scale) {
		return new Vector2D(this.x * scale, this.y * scale)
	}
	magnitude() {
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}
	normalise() {
		let mag = this.magnitude()
		this.x /= mag;
		this.y /= mag;
	}
	dot(vector) {
		return this.x * vector.x + this.y * vector.y
	}
}
class Hole {
	constructor(radius, x, y) {
		this.radius = radius;
		this.x = x;
		this.y = y;
	}
	draw() {
		c.fillStyle = 'black'
		c.beginPath();
		c.arc(this.x * scale, canvas.height - (this.y+1) * scale, this.radius * scale, 0, 2 * Math.PI);
		c.fill();
	}
}
class Ball {
	color = 'orange'
	collision = true;
	mass = 1;

	constructor(pos, vel, radius, color) {
		this.pos = pos;
		this.vel = vel;
		this.radius = radius;
		this.color = color;
	}
	draw() {
		c.fillStyle = this.color
		c.beginPath();
		c.arc(this.pos.x * scale, canvas.height - (this.pos.y+1) * scale, this.radius * scale, 0, 2 * Math.PI);
		c.fill();

		c.lineWidth = 4;
		c.beginPath();
		c.arc(this.pos.x * scale, canvas.height - (this.pos.y+1) * scale, this.radius * scale, 0, 2 * Math.PI);
		c.stroke();

		c.fillStyle = 'black';
	}
	updatePosition(time) {
		
		const x = Math.floor(this.pos.x);
		const y = Math.floor(this.pos.y) + 1;
		const dx = this.vel.x * time;
		const dy = this.vel.y * time;
		const pos = y * width + x;
		let flagX = true;
		let flagY = true;
		let flag = true;

		if (this.pos.x + dx + this.radius >= x + 1 && this.vel.x >= 0 && board[y][x+1] !== 0 && board[y] != undefined) {
			this.vel.x *= -1;
			this.pos.x += dx;
			flag = false;

		} else if (this.pos.x + dx - this.radius <= x &&
			this.vel.x <= 0 && board[y] != undefined &&
			board[y][x-1] !== 0) {
			this.vel.x *= -1;
			this.pos.x += dx;
			flag = false;
		} else {
			this.pos.x += dx;
		}

		if (this.pos.y + dy + this.radius >= y &&
			this.vel.y >= 0 && (board[y+1] == undefined ||
			board[y+1][x] !== 0)
		) {
			this.vel.y *= -1;
			this.pos.y += dy;
			flag = false;
		} else if (this.pos.y + dy - this.radius <= y - 1 &&
			this.vel.y <= 0 && (board[y-1] == undefined ||
			board[y-1][x] !== 0)
		) {
			this.vel.y *= -1;
			this.pos.y += dy;
			flag = false;
		} else if (flagY) {
			this.pos.y += dy;
		}
		// Corner code;	
		corner: if (flag) {

			const topLeftPos = {
				x: x,
				y: y
			}
			const topRightPos = {
				x: x + 1,
				y: y
			}
			const bottomLeftPos = {
				x: x,
				y: y - 1
			}
			const bottomRightPos = {
				x: x + 1,
				y: y - 1
			}
			if (y >= height-1 || y-1 < 0) break corner; 
			if        (board[y+1][x-1] !== 0 && pos%width - 1 > 0 && distanceSquared(topLeftPos, this.pos) <= this.radius ** 2) {
				this.collideCorner(topLeftPos);			
			} else if (board[y+1][x+1] !== 0 && pos%width + 1 < width && distanceSquared(topRightPos, this.pos) <= this.radius ** 2) {
				this.collideCorner(topRightPos);
			} else if (board[y-1][x-1] !== 0 && distanceSquared(bottomLeftPos, this.pos) <= this.radius ** 2) {
				this.collideCorner(bottomLeftPos);
			} else if (board[y-1][x+1] !== 0 && distanceSquared(bottomRightPos, this.pos) <= this.radius ** 2) {
				this.collideCorner(bottomRightPos);
			}
		}

		this.vel = this.vel.multiply(speedDecayRate);
	}
	intersectsRectangle(rectPos) {
		const disX = Math.abs(this.pos.x - rectPos.x);
		const disY = Math.abs(this.pos.y - rectPos.y);
		
		let cornerDistanceSquared = (disX - scale / 2) ** 2 + (disY - scale / 2) ** 2;

		return (cornerDistanceSquared <= this.radius ** 2);
	}
	isCollision(ball) {
		let distance2 = (this.pos.x - ball.x) ** 2 + (this.pos.y - ball.y) ** 2
		return distance2 <= (this.radius + ball.radius) ** 2 && ball !== this && this.collision;
	}
	collide(ballB) {
		const unitNormal = new Vector2D((ballB.pos.x - this.pos.x), (ballB.pos.y - this.pos.y));
		unitNormal.normalise()
		const unitTangent = new Vector2D(-unitNormal.y, unitNormal.x);

		const totalMass = this.mass + ballB.mass;

		const v1n = unitNormal.dot(this.vel);
		const v1t = unitTangent.dot(this.vel);
		const v2n = unitNormal.dot(ballB.vel);
		const v2t = unitTangent.dot(ballB.vel);

		const v1nDelta = (v1n * (this.mass - ballB.mass) + 2 * ballB.mass * v2n) / totalMass;
		const v2nDelta = (v2n * (ballB.mass - this.mass) + 2 * this.mass * v1n) / totalMass;


		this.vel = unitNormal.multiply(v1nDelta);
		this.vel.add(unitTangent.multiply(v1t));

		ballB.vel = unitNormal.multiply(v2nDelta);
		this.vel.add(unitTangent.multiply(v2t));


	}
	collideCorner(corner) {
		const unitNormal = new Vector2D((corner.x - this.pos.x), (corner.y - this.pos.y));
		unitNormal.normalise()
		const unitTangent = new Vector2D(-unitNormal.y, unitNormal.x);

		const v1n = unitNormal.dot(this.vel);
		const v1t = unitTangent.dot(this.vel);
	

		this.vel = unitNormal.multiply(-v1n);
		this.vel.add(unitTangent.multiply(v1t));

	

	}
}
const canvas = document.getElementById('c');
canvas.width = 700;
canvas.height = 700;
const c = canvas.getContext('2d');

const gravity = 0;
const lossyPercentage = 0.99;
const airResistance = 0.5; 
const min = 0.1;
const strikePower = 3;

var timeSinceCall = 0;
var timeSinceFrame = 0;  
const framesPerSecond = 60;
const speedDecayRate = airResistance**(1/framesPerSecond);

var strikeVector = {x: 0, y:0}
var golfBall;
var board = [];
board.length = 110;

var info;
fetch('game.json')
        .then((response) => response.json())
        .then((data) => info = data)
        .then(() => init("level1"))
;
function init(level) {
    let setup = info[level]
    width = setup.width;
    height = setup.height;
    scale = canvas.width/width;

    board = decode(setup.level);
    let balls = setup['balls'];
    let holes = setup['holes']
    golfBall = new Ball({x:balls[0].x, y:balls[0].y}, new Vector2D(0, 0), 0.3, 'white');
    hole = new Hole(0.4, holes[0].x, holes[0].y)
    main();
}
var width;
var height;
var scale;
const levelCount = 4;
var hole = new Hole(0.4, 5, 7)

function encode(arr) {
    let s = ""
    let last = arr[0][0]
    let count = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (arr[y][x] == last) count++; 
            else {
                s+=last+"."+count+",";
                last = arr[y][x]
                count = 1   
            }
        }
    }
    s+=last+"."+count;
    return s;
}
function decode(str) {
    let x = 0;
    let y = 0;
    let arr = [];
    arr.length=height;
    str = str.split(',');
    let f = 0;
    for (let i = 0; i < height; i++) {
        arr[i] = [];
        arr[i].length = width;
    }
    for (let z = 0; z < str.length; z++) {
        let a = str[z].split('.')
        let b = Number(a[0])
        let c = Number(a[1]);
        console.log(c)
        f+=c;
        for (let i = 0; i < c; i++) {
            arr[y][x] = b;
            x++;
            if (x == width) {x=0;y++;}
        }
    }
    console.log(f)
    return arr
}


var game = 0;

var flag = true;
function main(time = 0) {
    let elapsedTime = (time-timeSinceCall)/1000;
    timeSinceFrame += elapsedTime
    if (timeSinceFrame >= 1 /framesPerSecond) {
        timeSinceFrame = 0;
        c.fillStyle = 'green'
        c.fillRect(0, 0, canvas.width, canvas.height);

        c.fillStyle = 'black'
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                switch (board[row][col]) {
                    case 0: c.fillStyle = (row%2 + col%2)%2 == 0 ? '#7CB342' : '#8BC34A'; break;
                    case 1: c.fillStyle = 'black'; break
                    case 2: c.fillStyle = 'yellow'; break
                }
                c.fillRect(col*scale, canvas.width- (row+1)*scale,scale,scale)
            
            }
        }

        golfBall.updatePosition(1/framesPerSecond);
        hole.draw();
        golfBall.draw();
        if (golfBall.isCollision(hole)) {
            golfBall.vel.multiply(0.9)
            golfBall.vel.y = -(golfBall.pos.y - hole.y)*10;
            golfBall.vel.x = -(golfBall.pos.x - hole.x)*10;
            if (golfBall.pos.x <= hole.x + 0.01 && golfBall.pos.x >= hole.x - 0.01 && golfBall.pos.y <= hole.y + 0.01 && golfBall.pos.y >= hole.y - 0.01) {
                golfBall.vel.x = 0
                golfBall.radius *= 0.8
                if (flag)setTimeout(endGame, 600)
                flag = false

            }
            
        }
    }
    timeSinceCall = time;
    game = window.requestAnimationFrame(main);
}
function menu() {
    const menuButton = {x:1, y:4, width: 3, height:2}
    const nextButton = {x:6, y:4, width: 3, height:2}

    c.fillStyle = '#999'
    c.fillRect(menuButton.x*scale, menuButton.y*scale, menuButton.width*scale, menuButton.height*scale);
    c.fillRect(nextButton.x*scale, nextButton.y*scale, nextButton.width*scale, nextButton.height*scale);

}
function distanceSquared(pos1, pos2) {
    return (pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2
}   
var lc = 1;
function endGame() {
    cancelAnimationFrame(game)
    lc = lc%levelCount+1
    init('level' + lc.toString())
    flag = true;
    game = window.requestAnimationFrame(main);
}
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
class Ball {
	color = 'orange'
	collision = true;
	mass = 1;

	constructor(pos, vel, radius, color) {
		this.pos = pos;
		this.vel = vel;
		this.radius = radius;
		this.color = color;
	}
	draw() {
		c.fillStyle = this.color
		c.beginPath();
		c.arc(this.pos.x * scale, canvas.height - (this.pos.y+1) * scale, this.radius * scale, 0, 2 * Math.PI);
		c.fill();

		c.lineWidth = 4;
		c.beginPath();
		c.arc(this.pos.x * scale, canvas.height - (this.pos.y+1) * scale, this.radius * scale, 0, 2 * Math.PI);
		c.stroke();

		c.fillStyle = 'black';
	}
	updatePosition(time) {
		
		const x = Math.floor(this.pos.x);
		const y = Math.floor(this.pos.y) + 1;
		const dx = this.vel.x * time;
		const dy = this.vel.y * time;
		const pos = y * width + x;
		let flagX = true;
		let flagY = true;
		let flag = true;

		if (this.pos.x + dx + this.radius >= x + 1 && this.vel.x >= 0 && board[y][x+1] !== 0 && board[y] != undefined) {
			this.vel.x *= -1;
			this.pos.x += dx;
			flag = false;

		} else if (this.pos.x + dx - this.radius <= x &&
			this.vel.x <= 0 && board[y] != undefined &&
			board[y][x-1] !== 0) {
			this.vel.x *= -1;
			this.pos.x += dx;
			flag = false;
		} else {
			this.pos.x += dx;
		}

		if (this.pos.y + dy + this.radius >= y &&
			this.vel.y >= 0 && (board[y+1] == undefined ||
			board[y+1][x] !== 0)
		) {
			this.vel.y *= -1;
			this.pos.y += dy;
			flag = false;
		} else if (this.pos.y + dy - this.radius <= y - 1 &&
			this.vel.y <= 0 && (board[y-1] == undefined ||
			board[y-1][x] !== 0)
		) {
			this.vel.y *= -1;
			this.pos.y += dy;
			flag = false;
		} else if (flagY) {
			this.pos.y += dy;
		}
		// Corner code;	
		corner: if (flag) {

			const topLeftPos = {
				x: x,
				y: y
			}
			const topRightPos = {
				x: x + 1,
				y: y
			}
			const bottomLeftPos = {
				x: x,
				y: y - 1
			}
			const bottomRightPos = {
				x: x + 1,
				y: y - 1
			}
			if (y >= height-1 || y-1 < 0) break corner; 
			if        (board[y+1][x-1] !== 0 && pos%width - 1 > 0 && distanceSquared(topLeftPos, this.pos) <= this.radius ** 2) {
				this.collideCorner(topLeftPos);			
			} else if (board[y+1][x+1] !== 0 && pos%width + 1 < width && distanceSquared(topRightPos, this.pos) <= this.radius ** 2) {
				this.collideCorner(topRightPos);
			} else if (board[y-1][x-1] !== 0 && distanceSquared(bottomLeftPos, this.pos) <= this.radius ** 2) {
				this.collideCorner(bottomLeftPos);
			} else if (board[y-1][x+1] !== 0 && distanceSquared(bottomRightPos, this.pos) <= this.radius ** 2) {
				this.collideCorner(bottomRightPos);
			}
		}

		this.vel = this.vel.multiply(speedDecayRate);
	}
	intersectsRectangle(rectPos) {
		const disX = Math.abs(this.pos.x - rectPos.x);
		const disY = Math.abs(this.pos.y - rectPos.y);
		
		let cornerDistanceSquared = (disX - scale / 2) ** 2 + (disY - scale / 2) ** 2;

		return (cornerDistanceSquared <= this.radius ** 2);
	}
	isCollision(ball) {
		let distance2 = (this.pos.x - ball.x) ** 2 + (this.pos.y - ball.y) ** 2
		return distance2 <= (this.radius + ball.radius) ** 2 && ball !== this && this.collision;
	}
	collide(ballB) {
		const unitNormal = new Vector2D((ballB.pos.x - this.pos.x), (ballB.pos.y - this.pos.y));
		unitNormal.normalise()
		const unitTangent = new Vector2D(-unitNormal.y, unitNormal.x);

		const totalMass = this.mass + ballB.mass;

		const v1n = unitNormal.dot(this.vel);
		const v1t = unitTangent.dot(this.vel);
		const v2n = unitNormal.dot(ballB.vel);
		const v2t = unitTangent.dot(ballB.vel);

		const v1nDelta = (v1n * (this.mass - ballB.mass) + 2 * ballB.mass * v2n) / totalMass;
		const v2nDelta = (v2n * (ballB.mass - this.mass) + 2 * this.mass * v1n) / totalMass;


		this.vel = unitNormal.multiply(v1nDelta);
		this.vel.add(unitTangent.multiply(v1t));

		ballB.vel = unitNormal.multiply(v2nDelta);
		this.vel.add(unitTangent.multiply(v2t));


	}
	collideCorner(corner) {
		const unitNormal = new Vector2D((corner.x - this.pos.x), (corner.y - this.pos.y));
		unitNormal.normalise()
		const unitTangent = new Vector2D(-unitNormal.y, unitNormal.x);

		const v1n = unitNormal.dot(this.vel);
		const v1t = unitTangent.dot(this.vel);
	

		this.vel = unitNormal.multiply(-v1n);
		this.vel.add(unitTangent.multiply(v1t));

	

	}
}
