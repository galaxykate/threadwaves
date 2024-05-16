
class ActTest extends Act {
	// Stuff that happens

	constructor() {
		super()



		this.center = new Vector2D(app.p.width/2, app.p.height/2)
	

	}

	start({p, time, anim,sharedParticles}) {
		

	}

	kick(note) {
		super.kick(note)

	}

	update({p, time, anim, sharedParticles}) {	
		// console.log("update the act")
		// What kinds of forces should be applied to the shared particles?
	}

	draw({p, time, anim, layer}) {

		switch(layer) {	
			case "bg": 
				
				break;
			case "main": 
				p.push()
				p.translate(...this.center)


				p.pop()
				break;
			case "accent": 
				
				break;
		}





	}

}