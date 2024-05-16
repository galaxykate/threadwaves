class Animation {
	constructor({time, id, smooth=false}) {
		this.id = id
		this.time = time
		this.isReleased = false
		this.start = time.t
		this.releaseFrom = 1
		this.life = 0
		this.smooth = smooth
		this.payload = []
		
	} 


    update(args) {
      this.payload.forEach(item => item.update({...args, anim:this}))
    }

    draw(args) {
    	// console.log("DRAW", this.id, this.act)
      this.payload.forEach(item => item.draw({...args, anim:this}))
    }

    drawOverlay(args) {
    	// console.log("DRAW", this.id, this.act)
      this.payload.forEach(item => item.drawOverlay({...args, anim:this}))
    }

    drawBG(args) {
      this.payload.forEach(item => item.drawBG({...args, anim:this}))
    }


	get cssClasses() {
      return {
        "anim": true,
        ["anim-" + this.state]: true
      }
    }

    get state() {
      if (this.isDead)
        return "dead"
      if (this.isFull)
        return "full"
      if (this.isReleased)
        return "release"
      return "attack"
    }
    get isDead() {
      return this.isReleased && this.pct === 0
    }

    get isFull() {
      return !this.isReleased && this.pct === 1
    }

    get pct() {
      if (this.lifespan === 0)
        return 1
      
      let pct = Math.max(0, Math.min(1, this.age/this.lifespan))
      // console.log(this.age, this.lifespan, pct)
      if (this.smooth) {
      	let pct2 = .5 - .5*Math.cos(pct*Math.PI*1)
      	// console.log(pct, pct2)
      	pct = pct2
      }
      	

      if (this.isReleased === true) {
        
        return (1 - pct)*this.releaseFrom
      }
      return pct
    }
    get age() {
      return this.time.t - this.start
    }

    release({t}={t:1}) {
      if (!this.isReleased) {

        this.releaseFrom = this.pct
        this.lifespan = t
        this.start = this.time.t
        this.isReleased = true
      }
    }
    attack({t}={t:1}) {
	    this.lifespan = t
	    this.start = this.time.t
     	this.isReleased = false

      
    }

}