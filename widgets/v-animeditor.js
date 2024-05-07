let edCount = 0
class SequenceView {
	constructor(id, seq, scale, idNumber) {
		this.idNumber = idNumber
		this.id = id
		this.seq = seq
		this.scale = scale

		this.pct = Math.random()
		this.hue = (this.idNumber*50)%360

		// points.map(pt => )
	}
	get handles() {
		return this.seq.pts.map(pt => new EditorHandle(this, pt))
	}

	addPoint(pt) {
		this.seq.pts.push({
			pct: (pt.x - this.scale.x)/this.scale.w,
			val: (pt.y - this.scale.y)/this.scale.h
		})
		this.sort()
	}

	removePoint(handle) {

	}

	contains(pt) {
		return pt.isWithinBox(this.scale)
	}

	getPtFromX(x) {
		let pct = (x - this.scale.x)/this.scale.w
		return this.getPt(pct)
	}

	getPt(pct) {
		
		let val = getAtSequence(this.seq.pts, pct)

		return new Vector2D(pct*this.scale.w + this.scale.x, val*this.scale.h + this.scale.y)
	}

	draw(p) {
		
		p.fill(this.hue, 100, 90)
		p.noStroke()
		p.rect(this.scale.x, this.scale.y, this.scale.w, this.scale.h)
		p.fill(0)
		p.text(this.id, this.scale.x, this.scale.y + 10)
		this.handles.forEach(h => {
			h.draw(p)
		})

		p.strokeWeight(1)
		p.stroke(0)
		p.noFill()


		p.beginShape()
		this.handles.forEach(h => {
			p.vertex(h.x, h.y)
		})
		p.endShape()

		this.pct = (p.millis()/3000)%1
		let pt = this.getPt(this.pct)

		p.fill(this.hue, 100, 50)
		p.circle(...pt, 10)
	}

	sort() {
		this.seq.pts.sort((a,b) => a.pct - b.pct)
		// console.log("Sort", this.seq.pts.map(pt => pt.pct.toFixed(2)))
	}
}

// Edit as a curve, gradient, multicurve, and phases
class EditorHandle {
	constructor(editor, pt) {
		this.editor = editor
		this.pt = pt
	}
	get isVertical() {
		return this.editor.seq.type === "gradient"
	}
	get x() {
		return this.pt.pct*this.editor.scale.w + this.editor.scale.x
	}

	get y() {
		if (!this.isVertical)
			return this.pt.val*this.editor.scale.h + this.editor.scale.y
		return this.editor.scale.y + .5*this.editor.scale.h
	}

	get index() {
		return this.editor.seq.pts.indexOf(this.pt)
	}

	get isEndPoint() {
		return (this.index === 0 || this.index === this.editor.seq.pts.length - 1)
	}

	getDistanceTo(pt) {
		let dx = (pt.x - this.x)
		let dy = (pt.y - this.y)
		let y0 = this.y - this.editor.scale.h*.4
		let y1 = this.y + this.editor.scale.h*.4
		if (this.isVertical) {
			dy = 0
			if (pt.y < y0)
				dy = y0 - pt.y
			if (pt.y > y1)
				dy = pt.y - y1
			
		} 


		return Math.sqrt(dx*dx + dy*dy)
	}

	dragTo({target, pinEnds=true, clampX=true, clampY=true}) {
		let ed = this.editor
		
		let pct = (target.x - ed.scale.x) /ed.scale.w 
		let val = (target.y - ed.scale.y)/ed.scale.h 

		
		
		// ENDS
		if (this.isEndPoint)
			pct = this.pt.pct

		if (clampX)
			pct = Math.max(0, Math.min(1, pct))
		if (clampY)
			val = Math.max(0, Math.min(1, val))
		
		// Update the pos
		this.pt.pct = pct
		this.pt.val = val

		this.editor.sort()

	}

	draw(p) {

		p.circle(this.x, this.y, 10)
	}

	setPct(pct) {
		this.pt.pct = pct
	}
	
	setVal(pct) {
		this.pt.val = val
	}
}

class PhaseHandle extends EditorHandle {
	

	

	
}

Vue.component("anim-editor", {
	// Define the points on a curve
	// For an envelope, 
	//  we will also specify the distance from start or end

	template: `<div class="widget widget-animeditor">
	<div class="p5" ref="p5" />
	<div >
	control bar

	<textarea v-model="data" size="30" />
	<button @click="copyToClipboard">copy to clipboard</button>
	</div>
	<div v-for="seqEd in editors">{{seqEd.id}}</div>
	</div>
	</div>`,

	methods: {
		setActiveHandle(handle, state) {
			this.activeHandle = handle
			this.activeHandleState = state

		},
		clearActiveHandle() {
			this.activeHandle = undefined
			this.activeHandleState = undefined
		},

		changeMode() {
			// Update or change the mode, recreate all the handles
		},

		copyToClipboard() {
			navigator.clipboard.writeText(this.data);
		},


	},


	computed: {
		channels() {
			return this.animation.channels
		},

		editors() {
			// Make a bunch of views
			return Object.keys(this.channels).map((key,index) => {
				return new SequenceView(key, this.channels[key], {x:0, y: 50*index, w:200, h:50}, index)
				
			})
		},

		phaseHandles() {
			if (!this.phases)
				return []
			return this.phases.map(ph => new PhaseHandle(this.editor, ph))
		},

		handles() {
			// Get all of the handles from each sequence
			

			return [].concat(...this.editors.map(ed => ed.handles));
		},

		overEditor() {
			let seqEd = this.editors.find(ed => ed.contains(this.mouse))
			
			return seqEd
		},

		closest() {
			// Get the distance from the mouse to any of these items
			let closest = undefined
			let closestDist = 10

			this.handles.forEach(h => {
				let d = h.getDistanceTo(this.mouse)
				if (d < closestDist) {
					closestDist = d
					closest = h
				}
			})
			return closest
		},

		inWindow() {
			return this.mouse.isWithin(0, 0, p.width, p.height)
		},


		data: {
			get() {
				return this.animation.json
			},
			set(data) {
				this.animation.json = data
			}
			
		}
	},

	watch: {
		channels() {
			console.log("channels")
		}
	},

	mounted() {

		
		new p5((p) => {

			this.p = p

			p.setup = () => {
				p.createCanvas(300, 300);
				p.colorMode(p.HSL);
			}

			p.keyPressed = () => {
				if (p.keyCode === 8 || p.keyCode === 46) {
		   			// REMOVE

				}
			}

			p.mouseMoved = () => {
				this.mouse.setTo(p.mouseX, p.mouseY)
				if (this.inWindow)
					this.setActiveHandle(this.closest, "hovered")

			}

			p.mousePressed = () => {
				this.hovered = undefined
				console.log(this.inWindow)
				if (this.inWindow)
					this.setActiveHandle(this.closest, "held")
					
			}

			p.mouseReleased = () => {
				this.clearActiveHandle()
			}

			p.mouseDragged = () => {
				this.mouse.setTo(p.mouseX, p.mouseY)
				if (this.activeHandle) {
					// Where is this in the sequence?
					this.activeHandle.dragTo({target:this.mouse})
				}

			}

			p.mouseClicked = () => {
				if (this.inWindow) {
					if (!this.closest ) {
						// Clicked not 
						let pt = this.overEditor?.getPtFromX(this.mouse.x)
						let dy = Math.abs(this.mouse.y - pt.y)
						console.log(dy, this.mouse.y, pt.y)
						if (dy < 10)
							this.overEditor.addPoint(pt)

					} else {
						if (this.inWindow)
							this.setActiveHandle(this.closest, "selected")
					}
				}
			}

			p.draw = () => {
				p.background(280, 100, 50)
				
				this.editors.forEach(ed => ed.draw(p))

				if (this.activeHandle) {
					p.noFill()
					p.stroke(100)
					if (this.activeHandleState === "held") {
						p.strokeWeight(4)
					
					}
					if (this.activeHandleState === "selected") {
						p.strokeWeight(2)
					
					}
					if (this.activeHandleState === "hovered") {
						p.strokeWeight(1)
					
					}
					
					p.circle(this.activeHandle.x, this.activeHandle.y, 10)
				}
				
				
						
				// this.overEditor.addPoint(this.mouse)

			}
			
		}, this.$refs.p5);
	},
	data() {
		return {

			mouse: new Vector2D(),
			p:{}
		}
	},
	props: ["animation"]
})