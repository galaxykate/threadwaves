
class ActWind extends Act {
	// Stuff that happens

	constructor() {
		super()


		this.particles = new ParticleSystem({count: 300, 
			postCreate: (pt) =>{
				pt.setTo(Math.random()*app.p.width, Math.random()*app.p.height)
			}
		})
		this.center = new Vector2D(app.p.width/2, app.p.height/2)
	
		this.variance = .001

	}

	start({p, time, anim,sharedParticles}) {
		app.wrap = true

	}

	kick(note) {
		super.kick(note)

	}

	get allParticles() {
		return this.particles.pts.concat(app.sharedParticles.pts)
	}

	update({p, time, anim, sharedParticles}) {	
		
		let t = time.t*.01
		// console.log("update the act")
		// What kinds of forces should be applied to the shared particles?
		let border = 100
		let m = .001
		this.allParticles.forEach(pt => {
			let r = 10
			let theta = 20*noise(pt.x*m + this.noiseOffset, pt.y*m + this.noiseOffset,  t   + this.variance*pt.idNumber)
			pt.addPolar(r, theta)
			pt.wrap(-border, -border, p.width + border, p.height + border)
		})

	}

	draw({p, time, anim, layer}) {

		let t = time.t*.01

		switch(layer) {	
			case "bg": 

				let hue = 100
				let lightness = 50 + 40*noise(4*t)

				glitterFade({p, time, anim, 
						// scatter:20, scatterFalloff: 2,
						pts: app.sharedParticles,
						t: time.t*.6,
						color:[hue, 100, lightness], opacity:.05, 
						scatter: 100,
						hueScatter: 20,
						hueNoise: 40,
						radius: 200, minRadius:10})
					
				p.strokeWeight(1 + noise(t))
				p.stroke(0, 0, 0, anim.pct)
				
				break;
			case "main": 
				p.push()
				p.translate(...this.center)


				p.pop()
				break;
			case "accent": 
				p.noStroke()
				// p.stroke(0)
				p.fill(100)
				reduceAlpha({p, amt: .95})
				app.sharedParticles.forEach(pt => {
					p.circle(...pt, 30)
				})
				this.particles.forEach(pt => {
					p.circle(...pt, 10)
				})
				break;
		}





	}

}