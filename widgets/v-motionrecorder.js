/**
 * Record and playback motion
 * 
 **/

class Recording {
	constructor({entities, recordingData}) {
		this.start = Date.now()
		this.entities = entities
		this.frames = []
		this.frameTimes = []

		if (recordingData) {
			console.log("")
		}

	}

	setToFrame(index) {

	}

	recordFrame() {
		console.log("Record frame")
		// Record this data into the frame
		// We want it as a giant list of numbers for space-saving reasons
		let flatFrameData = this.entities.map(ent => ent.flatStringData)
		this.frames.push(flatFrameData)
	}

	saveToLocalStorage(prefix) {
		console.log("Save " + this)
		let id = prefix + this.start
		let data = JSON.stringify({
			title: "recording",
			start: this.start,
			entities: this.entities.map(ent => ent.name),
			frames:this.frames,
			id
		})

		
		localStorage.setItem(id, data)
	}


	toString() {
		return "recording_" + this.start + ` (${this.frames.length} frames)`
	}

}

Vue.component("motion-recorder", {
	// Define the points on a curve
	// For an envelope, 
	//  we will also specify the distance from start or end

	template: `<div class="widget widget-motionrecorder">
		<header>recorder</header>
		
		<select v-model="playbackRecordingID" >
			<option v-for="rec in localRecordings">{{rec.id}}</option>
		</select>
		<div>
			<button class="toggle-button" @click="toggleRecording">⏺</button> 
		</div>
		<div v-if="currentRecording">
			{{currentRecording.start}}
		</div>
	</div>`,

	computed: {


		localRecordings() {
			let recordings = []
			for (var i = 0; i < localStorage.length; i++) {
				let key = localStorage.key(i)
				
				if (key.startsWith(this.prefix)) {
					let item = JSON.parse(localStorage.getItem(key))
					recordings.push(item)
				}
			}
			return recordings
		},

		recordableEntities() {
			return [app.tracker.faces[0],app.tracker.hands[0],app.tracker.hands[1]] 
		}
	},


	methods: {
		toggleRecording() {
			if (this.isRecording)
				this.stopRecording()
			else 
				this.startRecording()
		},

		startRecording() {
			this.isRecording = true

			// Make a new recording
			this.currentRecording = new Recording({
				entities: this.recordableEntities
			})
				
		},

		stopRecording() {
			if (this.isRecording) {
				this.isRecording = false
				this.currentRecording.saveToLocalStorage(this.prefix)
				this.currentRecording = undefined
			}

		},

		setToFrame(frameData) {
			// Set to this frame
			this.currentRecording.entities.forEach((ent,index) => {
				ent.flatStringData = frameData[index]
			})
		},

		play(recordingData) {
			this.stopRecording()

			console.log("PLAY", recordingData.id)
			this.playbackRecording = new Recording({
				entities: this.recordableEntities,
				recordingData
			})
		}

	},

	watch: {
		playbackRecordingID() {
			console.log("Playback", this.playbackRecordingID)
			this.play(this.localRecordings.find(rec => rec.id === this.playbackRecordingID))
		}
	},
	mounted() {
		

		this.tracker.onDetect(() => {
			// Every frame...
			if (this.currentRecording && this.isRecording)
				this.currentRecording.recordFrame()
			// if (count === 50)
			// 	this.stopRecording()
		})

		// this.startRecording()

	},

	data() {
		return {
			isRecording: false,
			playbackRecordingID: undefined,
			playbackRecording: undefined,
			currentRecording: undefined,
			prefix: "recording_"
		}
	},

	props: ["tracker"]

})