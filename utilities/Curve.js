
// 
class CurvePath {
	// A single trace through points
	constructor() {
		this.points = []

	}
}

let curvePointCount = 0
class CurvePoint {
	constructor({pt, r0, theta0, t1, theta1, offsetR, offsetTheta}) {
		r0 = Math.random()*Math.PI*2
		r1 = Math.random()*Math.PI*2
		theta0 = Math.random()*100 + 40
		theta1 = Math.random()*100 + 40
		this.r0 = r0
		this.r1 = r1
		this.theta0 = theta0
		this.theta1 = theta1
		this.idNumber = curvePointCount++
	}

	get x() {
		return this.isRelative?this.pt.x || this.previous.
	}

	toString() {
		return this.idNumber
	}
}