class Act {
	// Stuff that happens

	constructor() {

		this.noiseOffset = Math.random()*1000
		this.idNumber = Act.count++
		this.idColor = [(this.idNumber*47)%360, 100, 50]
		this.center = new Vector2D(app.p.width/2, app.p.height/2)
		
	}

	update({p, time, anim}) {	


	}

	draw({p, time, anim}) {
		
	}

	drawBG({p, time, anim}) {
	
	}

	toString() {
		return this.constructor.name + this.idNumber
	}

	kick(note) {
		this.noiseOffset += Math.random()*1000
		app.sharedParticles.forEach(pt => {
			pt.velocity.addMultiple(pt.totalForce, 1)
		})
	}
}

Act.count = 0