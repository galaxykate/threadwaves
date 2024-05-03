Vue.component("color-picker", {
	template: `<input type="color" 
		v-model="hexColor" 
		@input="change" 
		@mousemove="change" 
	/>`,
	methods: {
		change() {
			let color = this.colormode==="hsl"? hexToHSL(this.hexColor):hexToRGB(this.hexColor);
			this.$emit("input", color);
		},

		computeHex() {

			let hex = this.colormode==="hsl"? hslToHex(...this.value):rgbToHex(...this.value)
			return hex
		}
	},

	watch: {
		value() {
			this.hexColor = this.computeHex()

		}
	},
	data() {
	
		return {
			hexColor: this.computeHex()
		};
	},
	props: {
		"value": {
			required:true,
		},
		"colormode": {
			default:"hsl",
		}
	},
});