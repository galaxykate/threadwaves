
Vue.component("envelope", {
	template: `<div class="envelope" :style="style">
		
	</div>`,
	computed: {
		style() {
			
			let t = 0
			let totalWidth = 100

			let y = this.envelope.idNumber*5
			let x0 = this.window.getPct(this.envelope.startTime)
			let x1 = this.window.getPct(this.envelope.stopTime)
			let w = x1 - x0

			let border = this.envelope.isActive?"1px solid black":"1px dashed grey"
			let opacity = this.envelope.isActive?1:.3
			let backgroundColor = `hsla(${this.envelope.hue.toFixed(2)}, 100%, 50%, ${opacity})`
			
			return {
				position:"absolute",
				top: `${y.toFixed(2)}%`,
				left: `${x0.toFixed(2)*100}%`,
				width: `${w.toFixed(2)*100}%`,
				height: "10px",
				border,
				backgroundColor,
			}
		}
	},
	props: ["envelope", "time", "window"]
})

Vue.component("timeline", {
	template: `<div class="widget widget-timeline" :style="style">
		<header>timeline</header>
		<envelope v-for="envelope in envelopes" 
			:envelope="envelope" 
			:window="window"
			:time="time" />
		<div :style="metronomeStyle" />
	</div>`,

	computed: {
		style() {
			return {
				width: this.width + "px"
			}
		},
		metronomeStyle() {

			let pct = this.window.getPct(this.time.t)
			// console.log("PCT", pct, this.time.t)
			return {
				width: "2px",
				height: "100%",
				position: "absolute",
				left: `${pct*100}%`,
				backgroundColor: "rgba(0,0,0,.2)",

			}
		}
	},

	data(){
		return {
			width: 200,
			window: {
				isLooping: true,
				getPct(t) {
					let pct = (t - this.start)/this.length
					if (this.isLooping)
						pct = (pct + 100000)%1
					return pct 
				},
				start: 0,
				length: 10000
			}
		}
	},

	props: ["envelopes", "time"]
})