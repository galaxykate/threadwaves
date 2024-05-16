let carlImageIndex = 0
let CARL_IMAGE_COUNT = 19

class ActCarl extends Act {
	// Stuff that happens

	constructor() {
		super()



		this.center = new Vector2D(app.p.width/2, app.p.height/2)
		// this.thread = new Curve({pts: this.particles})

		this.guideParticle = new Vector2D(100, 100)

		// this.particles = new ParticleSystem({

		// 	pts: [this.guideParticle],
		// 	postCreate:(pt)=>{
		// 		pt.setTo(this.guideParticle)
		// 		this.guideParticle.addPolar(20, Math.random()*100)
		// 		this.guideParticle.mult(.9)
		// 		console.log(pt)
		// 	}
		// })


	}

	start({p, time, anim,sharedParticles}) {
		// p.clear()

		console.log("ASSIGN PARTICLES TO IMAGES")
		
		for (var i = 0; i < 10; i++) {
			let pt = sharedParticles.pts[i]
			pt.radius = 100 + Math.random()*100
			// Assign images
			let imageIndex = (carlImageIndex++)%CARL_IMAGE_COUNT
			pt.image = new Image({
				filename:"carl" + imageIndex + ".jpeg", 
				pos:pt
			})
		}

		console.log("Images set")

	}

	kick(note) {
		super.kick(note)
		console.log(this + "- kick")
		this.particles.addPt()
	}

	update({p, time, anim, sharedParticles}) {	
		let t = time.t
		// console.log("update the act")
		// What kinds of forces should be applied to the shared particles?
		if (sharedParticles)
			sharedParticles.pts.forEach((pt, index) => {
				let t = time.t*.1
				let r = 200*noise(t, this.noiseOffset)
				let theta = 30*noise(t*.2 + index, this.noiseOffset)
				// console.log(r, theta)
				pt.totalForce.addPolar(r, theta)
				pt.theta += .2*(.5*noise(t*.1 + index))
				pt.theta *= .96

				pt.radius = 200 *(2 + noise(t*.4, index))
				pt.lerpTo(this.center, .001)

				if (pt.image) {
					pt.image.opacity = anim.pct
				
				}
				
			})

	}



	draw({p, time, anim, layer}) {
		let t = time.t*.1
		let hue = 20
		let lightness = 60

		// console.log(hue)
		switch(layer) {	
			case "bg": 

				reduceAlpha({p, amt: .95})

				glitterFade({p, time, anim, 
						// scatter:20, scatterFalloff: 2,
						pts: app.sharedParticles,
						t: time.t*.6,
						color:[hue, 100, lightness], opacity:.05, 
						
						radius: 400, minRadius:10})
					
				p.strokeWeight(1 + noise(t))
				p.stroke(0, 0, 0, anim.pct)

				
				// this.thread.drawDebug({p,time})

				break;
			case "main": 
				p.push()
				p.translate(...this.center)


				p.pop()
				break;
			case "accent": 
				p.clear()
				// glitterFade({p, time, anim, color:[0, 100, 100], opacity:10, radius: 5})
				
				app.sharedParticles.forEach(pt => {
					p.fill(100, 0, 100, .1)
					p.noStroke()
					p.circle(...pt, 100)
				})

				// this.particles.forEach(pt => {
				// 	p.circle(...pt, 5)
				// })

				// glitterFade({p, time, anim, 
				// 		// scatter:20, scatterFalloff: 2,
				// 		pts: app.sharedParticles,
				// 		t: time.t*.6,
				// 		color:[hue, 100, lightness], opacity:.5, 
				// 		starPoints: 5,
				// 		radius: 40, 
				// 		minRadius:10})
				
				break;
		}





	}

}