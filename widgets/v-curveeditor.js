class AnimationCurve {
	constructor() {
		this.points = []
	}

	addPoint(x, y) {
		let pt = new Vector2D(x, y)
		pt.curve = this
		this.points.push(pt)
		return pt
	}

	getVal(x) {
		let pt0,pt1
		for (var i = 0; i < this.points.length; i++) {
			pt0 = this.points[i - 1]
			pt1 = this.points[i]
			if (x < pt1.x) {
				if (i === 0) {
					// Off the beginning
					return pt1.y
				}

				return remap(x, pt0.x, pt1.x, pt0.y, pt1.y)
			}
		}
		return pt1.y
	}

	removePoint(pt) {
		this.points = this.points.filter(s => s!== pt)
	}

	sort() {
		this.points.sort((a,b) => a.x - b.x)
	}

	fromData(data) {
		this.points = []
		data.forEach(pt => this.addPoint(...pt))
	}

	toData(precision = 3) {
		let arr = this.points.map(pt => pt.toArray())
		return convertToFixedPrecision(arr,precision)
	}
}

class CurveEditor { 
	constructor(width=200, height=100, offsetX=0, offsetY=0) {
		this.width = width
		this.height = height
		this.offsetX = offsetX
		this.offsetY = offsetY

		
		this.hovered = undefined
		this.held = undefined
		this.selected = undefined

	}	

	setSize(width, height, offsetX=0, offsetY=0) {
		this.width = width
		this.height = height
		this.offsetX = offsetX
		this.offsetY = offsetY
	}


	setToCurve(curve) {
		this.curve = curve
		
		this.handles = this.curve.points.map(pt => new CurveEditorHandle(this, pt))
		this.curve.sort()
	}

	sort() {
		this.curve.sort()
		this.handles.sort((a,b) => a.x - b.x)
	}

	removePoint(handle) {
		this.curve.removePoint(handle.pt)
		this.handles = this.handles.filter(h => h!== handle)
		this.sort()			
	}

	setP5(p) {
		this.p = p
		makeP5Draggable({
			p,

			getDraggable: () => this.handles,
			move: (obj) => {

			},

			remove: (obj) => {
				
				// Remove the handle and its assosiated point
				let index = this.handles.indexOf(obj)
				if (index > 0 && index < this.handles.length - 1) {
					console.log("remove")
					this.removePoint(this.selected)
					
				} else {
					console.log(obj, index, "can't remove ends")
				}

			},

			hoverEnter: (obj) => {
				this.hovered = obj
			},
			hoverExit: (obj) => {
				this.hovered = undefined
			},

			pickup: (obj) => {
				console.log("pickup " + obj)
				this.held = obj
			},

			drop: (dropOnObj) => {

				this.held = undefined
			},

			drag: () => {
				if (this.held) {

					let index = this.handles.indexOf(this.held)
					
					let pctMouseX = this.getPctAtX(this.p.mouseX)
					let pctMouseY = this.getPctAtY(this.p.mouseY)
					let x = constrain(pctMouseX, 0, 1)
					let y = constrain(pctMouseY, 0, 1)

					if (index === 0)
						x = 0

					if (index === this.handles.length - 1)
						x = 1

					this.held.pt.x = x
					this.held.pt.y = y
				}
				this.sort()
			},

			dblclick: (obj) => {
				console.log("dblclick " + obj)
			},

			click: (obj) => {
				console.log("click " + obj)
						// Is this near a line?

				let pctX = this.getPctAtX(p.mouseX)
				let pctY = this.curve.getVal(pctX)
				
				console.log(this.isOnLine, this.distanceToLine)
				if (this.isOnLine && !obj) {
					console.log("Add handle")
					let pt = this.curve.addPoint(pctX, pctY)
					this.handles.push(new CurveEditorHandle(this, pt))
					this.sort()
				}

				this.selected = obj
			}
		})

	}

	get isOnLine() {
		return this.distanceToLine < 20
	}

	get distanceToLine() {
		let y = this.getYAtX(this.p.mouseX)
		return Math.abs(this.p.mouseY - y)
	}

	getXAtPct(pct) {
		return this.width*pct + this.offsetX
	}
	getYAtPct(pct) {
		return this.height*pct + this.offsetY
	}
	getPctAtX(x) {
		return (x - this.offsetX)/this.width
	}
	getPctAtY(y) {
		return (y - this.offsetY)/this.height
	}

	getYAtX(x) {
		let pctX = this.getPctAtX(x)
		let pctY = this.curve.getVal(pctX)
		return this.getYAtPct(pctY)
	}

	

	
	draw(p) {

		this.time = (p.millis()*.001)%1
		this.samplePct = this.time

		p.fill(320, 100, 50)
		p.rect(this.offsetX, this.offsetY, this.width, this.height)

		this.handles.forEach(h => h.draw(p))
		p.beginShape()
		p.strokeWeight(1)
		p.stroke(100, 100, 100)
		p.noFill()
		this.handles.forEach(h => p.vertex(h.x, h.y))
		p.endShape()


		
		let val = this.curve.getVal(this.samplePct)
		let x = this.getXAtPct(this.samplePct)
		let y = this.getYAtPct(val)
		p.stroke(100, 100, 100)
		p.noFill()
		let r = 4
		
		p.circle(x, y, r)
		
	}
}

let handleCount = 0

class CurveEditorHandle { 
		// A curve point, which might be on some arbitrary curve size
		// but also with screen x and y coordinates so we can drag it around
	constructor(editor, pt) {
		this.editor = editor
		this.idNumber = handleCount++

		this.pt = pt
		
	}	

	get isSelected() {
		return this.editor.selected === this
	}
	get isHovered() {
		return this.editor.hovered === this
	}	 

	get isHeld() {
		return this.editor.held === this
	}

	get x() {
		return this.editor.getXAtPct(this.pt.x)
	}

	get y() {
		return this.editor.getYAtPct(this.pt.y)
	}

	set x(val) {
		this.pctX = this.editor.getPctAtX(val)

	}

	set y(val) {
		this.pctY = this.editor.getPctAtY(val)
	}

	draw(p) {

		p.fill(0, 100, 100)


		p.circle(this.x, this.y, 10)

		p.noFill()
		if (this.isHovered) {
			p.strokeWeight(1)
			p.stroke(100, 100, 100)
			
			p.circle(this.x, this.y, 15)
		}
		if (this.isSelected) {
			p.strokeWeight(3)
			p.stroke(100, 100, 100)
			p.circle(this.x, this.y, 15)
		}
		p.noStroke()
		p.fill(0, 100, 100)
		// p.text(this.toString(), this.x, this.y + 10)


	}

	toString() {
		return "handle" + this.idNumber
	}
}

Vue.component("curve-editor", {
	// Define the points on a curve
	// For an envelope, 
	//  we will also specify the distance from start or end

	template: `<div class="widget widget-curveeditor">
	<div class="p5" ref="p5" />
	<input v-model="curveData" size="30"/>
	<button @click="copyToClipboard">copy to clipboard</button>
	</div>`,


	computed: {
			curveData: {
				get() {
					return this.curve.toData()
				},
				set(val) {
					let arr = JSON.parse(val)
					this.curve.fromData(arr)
					this.editor.setToCurve(this.curve)
				}
			}
	},

	methods: {
		copyToClipboard() {
			navigator.clipboard.writeText(this.curveData);
		},
	},

	mounted() {

		let count = 5
		for (var i = 0; i < count; i++) {
			let pct = i/(count - 1)

			this.curve.addPoint(pct,Math.random())
		}

		this.editor.setToCurve(this.curve)


		new p5((p) => {

			
			this.p = p


			p.setup = () => {
				p.createCanvas(300, 100);
				p.colorMode(p.HSL);

          // Create the editor when we know how big it is
				this.editor.setSize(p.width, p.height, 0, 0)
				this.editor.setP5(p)

			
		
			}	

			p.draw = () => {
				this.editor.draw(p)

			}
			
		}, this.$refs.p5);
	},
	data() {
		return {
			editor: new CurveEditor(),
			p:{}
		}
	},
	props: {
		"curve": {
			required: true
		}
	}
})