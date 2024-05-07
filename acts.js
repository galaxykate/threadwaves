
let ptCount = 0
class Particle extends Vector2D {
	constructor(x, y, time) {
		super(x,y)
		this.idNumber = ptCount++


		this.envelopes = {
		
		}
		this.time = time
		this.tStart = time.t
		this.lifespan = 3000
		this.decay = 400
		this.attack = 400
		this.isDead = false

	}

	get age() {
		return this.time.t - this.tStart
	}

	get animation() {
		if (this.age < this.attack) {

		}
	}

	update() {
		if (this.age < this.attack) {
			// play the at
		}
	}

}

const ACTS = [{
	id: "test",
	setup({p,time}) {

		this.animation = new Animation({
			
		})
		this.particles = []
		for (var i = 0; i < 10; i++) {
			let pt = new Particle(Math.random()*p.width, Math.random()*p.height, time)
			
			this.particles.push(pt)

		}
	},

	teardown({p,time}) {
		this.particles = []
	},	

	draw({p,time}) {



		// Update all particles
		this.particles.forEach(pt => {
			pt.age = pt.start - time.t

		})
		this.particles = this.particles.filter(pt => !pt.isDead)

		this.particles.forEach(pt => {
			p.fill(0)
			pt.draw(p, 20)
			p.text(pt.age.toFixed(2), pt.x, pt.y + 10)
		})
	}	


}]