
class Curve {
	// A curve with lots of chaos bits

	constructor({pts, parent}={}) {
		let last = undefined
		this.pts = []
		if (pts) {
			pts.forEach(pt => this.addPoint(pt))
		}
		
		console.log(`Creating curve with ${this.pts.length} pts`)
	}

	addPoint(pt) {
		let cpt = new CurvePoint({
			curve: this,
			pt,
			previous: this.last,
			isSmooth: true
		})
		this.pts.push(cpt)
		return this
	}

	get last() {
		return this.pts[this.pts.length - 1]
	}

	smooth() {
		// Smooth this curve as best we can
		for (var i = 0; i < pts.length; i++) {
			

		}
		return this

	}

	update({p, time}) {

		this.pts.forEach(pt => {
			pt.update()
		})

		return this	
	}

	//=========================================================================
	//=========================================================================
	//=========================================================================
	// Offsets

	getBezierCoordinates(index) {
		let p0 = this.pts[index].pt.toArray()
		let p1 = this.pts[index].cp1
		let p2 = this.pts[index+ 1].cp0
		let p3 = this.pts[index + 1].pt.toArray()
		return [p0, p1, p2, p3]
	}

	createChild() {
		// Make adep
		let childPoints = this.pts.map(pt=> {
			let pt2 = new Vector2D(pt)
			pt2.parent = pt
		})

		return new Curve({
			parent:this,
			pts: childPoints
		})
	}

	
	setPointTo(pt, index) {


		let i0 = Math.floor(index)
		// console.log(index, i0)

		let t0 = index%1
		// Clamp
		if (i0 > this.pts.length - 2) {
			i0 = this.pts.length-2
			t0 = 1
		}
		if (i0 < 0) {
			i0 = 0
			t0 = 0
		}

		let [p0, p1, p2, p3] = this.getBezierCoordinates(i0)
		
		// console.log(i0, i0+1, this.pts.length, this.pts[i0])
		
		let t1 = 1 - t0

		// console.log(p0, p1, p2, p3)
		let v = p0.map((x, index) => {
			return p0[index]*t0*t0*t0
			 + 3*p1[index]*t0*t0*t1
			 + 3*p2[index]*t0*t1*t1
			 + p3[index]*t1*t1*t1
		})


	
		let dv = p0.map((x, index) => {
			return 3*t0*t0*(p1[index] - p0[index])
			 + 6*t0*t1*(p2[index] - p1[index]) 
			 + 3*t1*t1*(p3[index] - p2[index])
		})

		pt.setTo(...v)
		pt.normalAngle = Math.atan2(dv[1], dv[0]) + Math.PI/2

		// console.log(i0, t0, v)
		return this
	}


	getPoint(index) {
		

		

	}


	//=========================================================================
	//=========================================================================
	//=========================================================================
	// Drawing

	bezierVertices({p, offset, reverse=false}) {
		this.pts.forEach(pt => pt.bezierVertex({p, offset, reverse}))
	}

	draw({p, time}) {

		p.beginShape()
		this.bezierVertices({
			p, 
			reverse:false})
		p.endShape()
	}

	

	drawDebug({p,time}) {

		let t = time.t*.001
		p.fill(320, 100, 90)
		// this.pts.forEach(pt => {
		// 	pt.drawDebug(p, 6)
		// })

		// p.noFill()
		// p.stroke(0)
		// p.beginShape()
		// this.pts.forEach(pt => {
		// 	p.vertex(...pt.pt)
		// })
		// p.endShape()

		p.stroke(0)
		p.noFill()
		p.beginShape()
		
		this.bezierVertices({
			p, 
			reverse:false})
		p.endShape()
		

		let count = 300
		let pt = new Vector2D()
		for (var i = 0; i < count; i++) {
			let index = ((this.pts.length)* (t*.02 + i/count ))%this.pts.length
			this.setPointTo(pt, index)
			p.fill((i*20)%360, 100, 50)
			// p.circle(...pt, 10)
			pt.drawPolarCircle(p, 20, pt.normalAngle, 10)
			pt.drawPolarLine(p, 20, pt.normalAngle)
		}
	}
}

class CurvePoint {	
	constructor({pt, r0=0, theta0=0, r1=0, theta1=0, isSmooth=false, previous, index, curve}) {
		this.pt = pt || new Vector2D()
		this.r0 = r0
		this.theta0 = theta0
		this.r1 = r1
		this.theta1 = theta1
		this.isSmooth = isSmooth
		this.previous = previous
		if (this.previous)
			this.previous.next = this
		this.next = undefined
		this.index = index
		this.curve = curve

		this.dir0 = new Vector2D()
		this.dir1 = new Vector2D()
		this.dir = new Vector2D()
		this.offset0 = new Vector2D()
		this.offset1 = new Vector2D()
		this.n = new Vector2D()
		this.d0 = 0
		this.d1 = 0



	}



	update() {
		// Smooth

		if (this.previous) {
			this.offset0.setToOffset(this.pt, this.previous.pt)
			this.d0 = this.offset1.magnitude
			if (this.d0)
			this.dir0.setToMultiple(this.offset0, 1/this.d0)
		}
		if (this.next) {
			this.offset1.setToOffset(this.pt, this.next.pt)
			this.d1 = this.offset1.magnitude
			if (this.d1)
			this.dir1.setToMultiple(this.offset1, 1/this.d1)
		}

		// console.log(this.d0, this.d1)
		this.dir.setToAddMultiple(this.dir0, -1, this.dir1, 1)
		// console.log(this.offset0, this.d0, this.dir0)
		// console.log(this.dir0, this.dir1)
		let m = this.dir.magnitude
		let round = .4
		this.r0 = m*this.d0*round
		this.r1 = m*this.d1*round
		// console.log(this.dir, m, this.d0, this.d1, this.r0, this.r1)
		this.theta0 = this.dir.angle + Math.PI
	}

	get cp0() {
		return [this.pt.x + this.r0*Math.cos(this.theta0), this.pt.y + this.r0*Math.sin(this.theta0)]
	}

	get cp1() {
		if (this.isSmooth)
			this.theta1 = this.theta0 + Math.PI
		return [this.pt.x + this.r1*Math.cos(this.theta1), this.pt.y + this.r1*Math.sin(this.theta1)]
	}

	

	bezierVertex({p, offset=0, reverse=false}) {
		let theta = this.theta0 + Math.PI/2
		let r = offset
		
		if (typeof offset === 'function') {
			r = offset({pt: this, index: this.index})

		}

		let p0 = this.previous?.cp1
		let p1 = this.cp0
		let p2 = this.pt


		if (this.previous) {

			// p.bezierVertex(...p0, ...p1, ...p2)
			p.bezierVertex(
				p0[0] + r*Math.cos(theta), p0[1]+ r*Math.sin(theta), 
				p1[0] + r*Math.cos(theta), p1[1] + r*Math.sin(theta), 
				p2.x + r*Math.cos(theta), p2.y + r*Math.sin(theta))
		}
		
		else
			p.vertex(...this.pt)

	}

	drawDebug(p) {
		p.fill(0)
		p.circle(...this.pt, 10)
		p.fill(100, 100, 90)
		p.stroke(100)
		// p.line(...this.pt, ...this.cp0)
		// p.line(...this.pt, ...this.cp1)
		// p.circle(...this.cp0, 10)
		// p.circle(...this.cp1, 10)

		this.pt.drawArrow({
			p, 
			v: this.dir0,
			multiplyLength: 20,
			color: [150, 100, 50]
		})
		this.pt.drawArrow({
			p, 
			v: this.dir1,
			multiplyLength: 20,
			color: [150, 100, 50]
		})

		this.pt.drawArrow({
			p, 
			v: this.dir,
			multiplyLength: 20,
			color: [50, 100, 50]
		})
	}	
}