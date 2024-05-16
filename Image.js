let IMGPATH = "img/"

Vue.component("image-frame", {
	template: `<div class="image-frame" :style="style">
		<img :src="img.filePath" :style="imgStyle" >
	</div>`,
	computed: {
		w() {
			return this.img.pos.radius
		},
		style() {
			return {
				position: "absolute",
				left: `${this.img.pos.x.toFixed(2)}px`,
				top: `${this.img.pos.y.toFixed(2)}px`,
				width: `${this.w.toFixed(2)}px`,
				// height: "100px",
				transform: `rotate(${this.img.pos.theta.toFixed(4)}rad)`,
				opacity:  `${this.img.opacity.toFixed(2)}`,
				backgroundColor: "magenta"
			}
		},

		imgStyle() {

			return {
				// border: "10px solid lime",
				position: "absolute",
				left: (-this.w*.5).toFixed(2)+`px`,
				top: (-this.w*.5).toFixed(2) +`px`,
				
			}
		}
	},
	props: ["img"]
})


let imageCount = 0
class Image {
	constructor({filename, pos}) {
		this.filename = filename
		this.opacity = 1
		this.pos = pos
		this.idNumber = imageCount++
		// console.log("Image", this.idNumber, this.filename)
		if (!this.pos)
			console.warn("no pos")

		
	}

	update({p, time}) {

	}

	get filePath() {
		return IMGPATH + this.filename
	}


}