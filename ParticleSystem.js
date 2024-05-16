// Upgrade a list of Vector2Ds to particles with forces n shit

class ParticleSystem {
	constructor({pts, postUpdate, preUpdate, postCreate,count=0}={}) {

	
		this.postUpdate = postUpdate
		this.preUpdate = preUpdate
		this.postCreate = postCreate

		

		// Make a random starting set
		if (!pts) {
			this.pts = []
			for (var i = 0; i< count; i++) {
				this.addPt()
			}
		} else {
			this.pts = pts.map(pt => this.initializePt(pt))
		}

		

	}

	forEach(fxn) {
		this.pts.forEach((pt,index) => fxn(pt, index))
	}

	initializePt(pt) {
		pt.image = undefined
		pt.velocity = Vector2D.polar(20, Math.random()*100)
		pt.totalForce = new Vector2D()
		pt.mass = 1
		pt.idNumber = ParticleSystem.ptCount++
		pt.radius = 10
		pt.theta = Math.random()*.1

		this.postCreate?.(pt)
		return pt
	}

	addPt(postCreate) {
		let pt = new Vector2D()
		this.initializePt(pt)
		this.pts.push(pt) 
		postCreate?.(pt)
	}

	clearForces() {
		this.pts.forEach(pt => pt.totalForce.mult(0))
	}

	setForces({p, time}) {
		this.pts.forEach((pt,index) => {
			let r = 100
			let theta = 20*noise(index, time.t*.1)
			pt.totalForce.addPolar(r, theta)
		})
	}

	move({p, time, dt}) {
		if (this.preUpdate)
			this.pts.forEach((pt,index) => this.preUpdate({pt,p,time}))

		this.pts.forEach((pt,index) => {
			pt.velocity.addMultiple(pt.totalForce, dt)
			pt.addMultiple(pt.velocity, dt)

			pt.velocity.mult(.9)
		})

		if (this.postUpdate)
			this.pts.forEach((pt,index) => this.postUpdate({pt,p,time}))

	}

	drawDebug({p, time}) {
		p.noFill()
		this.pts.forEach(pt => {
			p.stroke(0)
			p.circle(...pt, 20)
			pt.drawArrow({
				p,
				v:pt.totalForce
			})
		})
	}
}

ParticleSystem.ptCount = 0


