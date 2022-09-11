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