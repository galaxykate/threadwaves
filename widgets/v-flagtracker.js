Vue.component("flag-tracker", {
	// Track lots of flags for debugging
	template: `<div>
		
		<table>
			<tr v-for="val,k in obj">
				<td>{{k}}</td>
				<td>
					<input type="checkbox" v-model="obj[k]" v-if="typeof(val) === 'boolean'" />
					<input type="range" v-model.number="obj[k]" v-else-if="typeof(val) === 'number'" min="0" max="1" step=".05" />
					<select v-model="obj[k]" v-else-if="typeof(val) === 'string'">
						<option v-for="option in options[k]">
							{{option}}
						</option>
					</select>
				</td>
			</tr>
		</table>
	</div>`,

	watch: {
		obj: {
			deep:true,
			handler() {
				console.log("obj changed")
				let data = JSON.stringify(this.obj)
				console.log(data)
				localStorage.setItem("flagtracker_" + this.id, data)
			}
		}
	},

	mounted() {
		// load the obj from local storage if exists
		let json = localStorage.getItem("flagtracker_" + this.id)
		if (json) {
			let vals = JSON.parse(json)
			Object.keys(vals).forEach(key => {
				this.obj[key] = vals[key]
			})
		}
	},

	data() {
		return {}
	},

	props: ["obj", "id", "options"]
})