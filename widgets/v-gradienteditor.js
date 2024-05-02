let gradientPointCount = 0
class Gradient {

	constructor() {
		this.points = []
		this.colorMode = "RGB"

		let count = 3
		for (var i = 0; i < count; i++) {
			let pct = i/(count-1)
			this.addPoint(pct, [Math.random()*255, Math.random()*255, Math.random()*255])
		}


		this.sort()
	}

	sort() {
		this.points.sort((a,b) => a.pct - b.pct)
	}

	getAt(pct) {
		let pt0,pt1
		for (var i = 0; i < this.points.length; i++) {
			pt0 = this.points[i - 1]
			pt1 = this.points[i]
			if (pct < pt1.pct) {
				if (i === 0) {
					// Off the beginning
					return pt0.color.slice()
				}

				return remapArray(pct, pt0.pct, pt1.pct, pt0.color, pt1.color)
			}
		}
		return pt1.color.slice()
	}

	addPoint(pct, color) {
		let pt = {
			idNumber: gradientPointCount++,
			pct, 
			// color: [Math.random()*360,100,Math.random()*100],
			color: color || this.getAt(pct)
		}
		this.points.push(pt)
		return pt
	}

	toData() {
		let data = this.points.map(pt =>  [pt.pct, pt.color])
		return convertToFixedPrecision(data, 2)
	}

	fromData(data) {
		console.log(data)
		this.points = []
		data.forEach(ptData => {
			this.addPoint(...ptData)
		})
	}

}


Vue.component("gradient-editor", {
	// Define the points on a curve
	// For an envelope, 
	//  we will also specify the distance from start or end

	template: `<div class="widget widget-gradienteditor">
		<div class="p5" ref="p5" />
		<div >
			<color-picker 
				v-for="point in gradient.points" 
				:key="point.idNumber" 
				v-model="point.color" 
				colormode="rgb"
				@change="val=>change(val,point)" />
		</div>
		<input v-model="gradientData" size="30" />
		<button @click="copyToClipboard">copy to clipboard</button>
	</div>`,

	methods: {

		copyToClipboard() {
			navigator.clipboard.writeText(this.gradientData);
		},

		change(val, point) {
			console.log("color change", val, point)
		},
		closestPt() {
			let pctX = this.p.mouseX / this.p.width
			let closest = undefined
			let closestDist = 20
			
			for (var i = 0; i < this.gradient.points.length; i++) {
				let pt = this.gradient.points[i]
				let x = pt.pct*this.p.width
				let d = Math.abs(this.p.mouseX  - x)
				if (d < closestDist) {
					closestDist = d
					closest = pt
				}
			}
			return closest
		},
	},


	computed: {

		gradientData: {
			get() {
				return this.gradient.toData()
			},
			set(val) {
				let arr = JSON.parse(val)
				this.gradient.fromData(arr)
			}
		}
	},



	mounted() {

		
		new p5((p) => {

			function inWindow() {
		        return p.mouseX >= 0 && p.mouseY >= 0 && p.mouseX <= p.width && p.mouseY <= p.height
		    }

			this.p = p


			p.setup = () => {
				p.createCanvas(300, 100);
				p.colorMode(p.HSL);

			}	

			p.keyPressed = () => {
		        console.log(p.keyCode)
		        if (p.keyCode === 8 || p.keyCode === 46) {
		        	let pt = this.closestPt()
		            this.gradient.points = this.gradient.points.filter(s => s!== pt)
		        }
    		}

			p.mouseMoved = () => {
				if (inWindow())
					this.hovered = this.closestPt()
				
			}

			p.mousePressed = () => {
				if (inWindow())
					this.held = this.closestPt()	
			}

			p.mouseReleased = () => {
				this.held = undefined
			}

			p.mouseDragged = () => {
				
				if (this.held) {
					let index = this.gradient.points.indexOf(this.held)
					if (index > 0 && index < this.gradient.points.length - 1) {

						this.gradient.sort()
						this.held.pct = constrain(p.mouseX/p.width, 0, 1)
					}
				}

			}

			p.mouseClicked = () => {
				if (!this.closestPt() && inWindow()) {
					// add new
					console.log("Add new")
					this.gradient.addPoint(p.mouseX/p.width)
				}
			}

			p.draw = () => {
				p.background(280, 100, 50)

				p.colorMode(p[this.gradient.colorMode])
				
				let count = 70
				p.noStroke()
				for (var i = 0; i < count; i++) {
					let pct = i/(count - 1)
					
					let c = this.gradient.getAt(pct)
					
					p.fill(...c)
					p.rect(pct*p.width, 0, p.width/count + 1, p.height)
				}

				
				this.gradient.points.forEach(pt => {
					p.fill(...pt.color)
					let x = p.width*pt.pct

					p.stroke("white")
				
					p.strokeWeight(1)
					if (this.hovered === pt) {
						p.strokeWeight(3)
					}
					p.rect(x -5, 0, 10, p.height)
				})
				p.colorMode(p.HSL)
			}
			
		}, this.$refs.p5);
	},
	data() {
		return {
			
			p:{}
		}
	},
	props: ["gradient"]
})