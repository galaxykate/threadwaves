
class TouchableWindow {
	constructor({id, p, getTouchables}) {
		/** 
		 * Is this a p5 instance? or something else?
		 **/
		this.id = id
		this.p = p
		this.pos = new Vector2D()
		this.getTouchables = getTouchables
		console.log(id, getTouchables)
	}

	getDistanceTo(obj) {
		if (obj.getDistanceTo) {
			obj.getDistanceTo(this.pos)
		}
		else {
			let d = this.pos.getDistanceTo(obj)
			return d
		}
	}

	update() {
		this.pos.setTo(this.p.mouseX, this.p.mouseY)
	}

	enter() {
		// When we enter this
	}

	exit() {
		//
	}
}

class DraggableMouse {
	/**
	 * One draggable mouse, for a page that may include many p5 instances
	 * and other places to drag and drop things to
	 * 
	 * We want to 
	 * - know which p element we are on top of
	 * - pick up any draggables where we are
	 * - track things we are holding
	 * - hover over hovered things
	 * - drop any currently held things 
	 * - know the speed of mouse movement 
	 * - remember past positions (global and relative to p5)
	 * 
	 * 
	 * Interactions:
	 *  only start dragging from a p5 instance
	 *      to avoid UI collision (ie, no "dragging" from a slider nearby)
	 *  but release whenever
	 **/

	constructor() {
		this.windows = []
		this.touchedObjects = []
		this.selected = undefined

		document.addEventListener('touchdown',  () => this.startTouch())
		document.addEventListener('mousedown',  () => this.startTouch())
		document.addEventListener('touchmove',  () => this.move())
		document.addEventListener('mousemove',  () => this.move())
		document.addEventListener('mouseup',    () => this.endTouch())
		document.addEventListener('touchup',    () => this.endTouch())


	}

	addWindow(settings) {
		this.windows.push(new TouchableWindow(settings))
	}

	get overWindows() {
		return this.windows.filter(p => p.mouseX >= 0 && p.mouseY >= 0 
			&& p.mouseX <= p.width && p.mouseY <= p.height)
	}


	get touchableObjects() {
		return [].concat(...this.windows.map(w => w.getTouchables().map(obj => {
			return {
				obj,
				window:w,
				dist: w.getDistanceTo(obj)
			}
		})));
	}


	startTouch() {


		console.log("Down!")
	}

	endTouch() {
		console.log("Up!")
	}

	calculateTouchedObjects() {
		let range = 100
		let previous = this.touchedObjects.slice()

		// this.touchableObjects.forEach(({obj, dist}) => {
		// 	console.log(obj.toString(), dist)
		// })

		this.touchedObjects = this.touchableObjects.filter(({obj,dist}) => {
			if (dist < range) {
				return true
			}
		})
		this.touchedObjects.sort((a,b) => a.dist - b.dist)
		
		let objs0 = previous.map(o => o.obj) 
		let objs1 = this.touchedObjects.map(o => o.obj) 
		let overlap = calculateListOverlap(objs0, objs1)
		// if (overlap.a || overlap.b) {
		// 	console.log("PREVIOUS", objs0.map(o => o.toString()))
		// 	console.log("TOUCHED", objs1.map(o => o.toString()))
		// 	console.log("EXIT", overlap.a.map(o => o.toString()))
		// 	console.log("ENTER",overlap.b.map(o => o.toString()))
		// }

		overlap.a.forEach(o => o.touchExit?.())
		overlap.b.forEach(o => o.touchEnter?.())
		// console.log(overlap.both.map(o => o.toString()))


		// pick the closest and select it

		let toSelect = this.touchedObjects[0]?.obj
		if (toSelect !== this.selected) {
			this.selected?.deselect?.()
			toSelect?.select?.()
			this.selected = toSelect
		}
	}

	move() {
		console.log("Move")
		this.windows.forEach(w => w.update())
		this.calculateTouchedObjects()
	}


}
