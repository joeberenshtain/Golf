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
		/* 
			Below is the map borders code that makes the ball bounce back
			after wall collisions.
		*/


		/* 
			Above is the map borders code that makes the ball bounce back
			after wall collisions.
		*/

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
		// Corner code;	

		//this.pos.y += this.vel.y * time;
		this.vel = this.vel.multiply(speedDecayRate);
	}
	intersectsRectangle(rectPos) {
		const disX = Math.abs(this.pos.x - rectPos.x);
		const disY = Math.abs(this.pos.y - rectPos.y);
		//if (disX > scale/2 + this.radius) return false;
		//if (disY > scale/2 + this.radius) return false;

		let cornerDistanceSquared = (disX - scale / 2) ** 2 + (disY - scale / 2) ** 2;

		return (cornerDistanceSquared <= this.radius ** 2);
	}
	isCollision(ball) {
		let distance2 = (this.pos.x - ball.pos.x) ** 2 + (this.pos.y - ball.pos.y) ** 2
		return distance2 <= (this.radius + ball.radius) ** 2 && ball !== this && this.collision;
	}
	collide(ballB) {
		const unitNormal = new Vector2D((ballB.pos.x - this.pos.x), (ballB.pos.y - this.pos.y));
		unitNormal.normalise()
		const unitTangent = new Vector2D(-unitNormal.y, unitNormal.x);

		// Sets up the two vector axises
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

		// Sets up the two vector axises
		//const totalMass = this.mass + ballB.mass;

		const v1n = unitNormal.dot(this.vel);
		const v1t = unitTangent.dot(this.vel);
		//const v2n = unitNormal.dot(ballB.vel);
		//const v2t = unitTangent.dot(ballB.vel);

		//const v1nDelta = (v1n * (this.mass - ballB.mass) + 2 * ballB.mass * v2n) / totalMass;
		//const v2nDelta = (v2n * (ballB.mass - this.mass) + 2 * this.mass * v1n) / totalMass;


		this.vel = unitNormal.multiply(-v1n);
		this.vel.add(unitTangent.multiply(v1t));

		//ballB.vel = unitNormal.multiply(v2nDelta);
		//this.vel.add(unitTangent.multiply(v2t));


	}
}