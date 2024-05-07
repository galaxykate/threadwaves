function ptsToData(pts, precision=2) {
	let pts2 = pts.map(pt => [pt.pct, pt.val])
	return pts2
} 

function dataToPts(pts) {
	
} 

class Animation {
	// A bundle of behaviors to play at different times
	constructor({channels}) {
		this.channels = channels
	}

	get json() {
		let channelData = mapObject(this.channels, (channel,id) => {
			return {
				mode: channel.mode,
				type: channel.type,
				pts: ptsToData(channel.pts)
			}
		})

		let fixedData = convertToFixedPrecision(channelData, 3)
			
		return JSON.stringify(fixedData,function(k,v){
			if(v instanceof Array)
				return JSON.stringify(v);
			return v;
		},2);
	}

	set json(data) {
		let channelData = JSON.parse(data)
		console.log(channelData)

		// this.channels = {}
		mapObject(channelData, (val,key) => {
			let pts = JSON.parse(val.pts)
			let newChannel = {
				mode: val.mode,
				type: val.type,
				pts: pts.map(pt => {
					return {
						pct: pt[0],
						val: pt[1],
						id: crypto.randomUUID()
					}
				})
			}
			this.channels[key] = newChannel
			// console.log(this.channels[key], newChannel)
			
		})
	}

	// getPhase({t, tAttack, tRelease, timings:{attack,preAttack,release,preRelease,sustainLoop}}) {
	// 	// Which phase and where are we?
	// 	if ((t < tAttack - lenAttack) || tAttack === undefined) {
	// 		// Nothing, we havent started yet
	// 		return ["pre",0]
	// 	}

	// 	// Pre-Attack (requires prediction)
	// 	if (lenPreAttack && t < tAttack) {
	// 		return ["preAttack", (tAttack - t)/lenPreAttack]
	// 	}

	// 	// Attack
	// 	if (lenAttack && t < tAttack + lenAttack) {
	// 		return ["attack", (tAttack - t)/lenAttack]
	// 	}
	// }

	// // Play at this current timing
	// play({t, tAttack, tRelease}) {

	// 	// What should be be playing right now?
		

	// }
}
