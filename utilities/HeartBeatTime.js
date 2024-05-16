
Vue.component("heartbeat-time", {
  template: `<div class="widget widget-heartbeat">
    <header>time</header>
    <div>
        <input type="range" min="0" max="2" step=".1" v-model.number="time.speed" />
    </div>
    <table>
      <tr v-for="k in tableKeys" :key="k">
        <td>{{k}}</td><td>{{time[k]}}</td>
      </tr>
    </table>
  </div>`,
  data() {
    return {
      tableKeys: ["t", "dt", "beat", "measure", "loopOver", "loopCount"]
    }
  },
  props: ["time"]
})

class HeartBeatTime {
    // An assortment of useful time stuff
    // a SimCity style heartbeat

    constructor({timeSignature=12, maxDT=100,startTime, beatEvery=5, loopOver=0}={})  {
        this.dt = 1
        this.t = 0
        this.maxDT = maxDT
        this.timeSignature = timeSignature
        this.beat = 0
        this.measure = 0
        this.frame = 0
        this.mult = .001
        
        this.startTime = startTime === undefined?Date.now()*this.mult:startTime
        this.lastUpdate = this.startTime
        
        this.speed = 1

        this.isPaused = 0
        this.pauseStart = 0
        this.totalPausedTime = 0
        
        this.loopOver = loopOver
        this.loopCount = 0

        this.beatEvery = beatEvery
        this.beatCounter = 0

        this.heartbeatFxns = []
    }

    onHeartbeat(fxn) {
        this.heartbeatFxns.push(fxn)
    }

    togglePause() {
        // // Stop the pause
        // if (this.isPaused) {
        //     // How much time were we paused for?
        //     this.totalPausedTime += this.lasty - this.pauseStart
        // } else {
        //     // Start the pause
        //      this.pauseStart = this.lastClockTime
        // }
        // this.isPaused = !this.isPaused
    }

    update(currentTime) {
        if (currentTime=== undefined)
            currentTime = Date.now()*this.mult

        // Record the clock time even when paused
       
        if (!this.isPaused) {
            this.frame  += 1


            // How much time has passed?
            // Increase this amount of time
            let dt = (currentTime - this.lastUpdate)*this.speed

            this.dt = Math.min(dt, this.maxDT)
            this.t += this.dt

            this.beatCounter += 1
            if (this.beatCounter >= this.beatEvery) {
                this.beatCounter = 0
                this.beat += 1 

                if (this.beat >= this.timeSignature) {
                    this.beat = 0
                    this.measure += 1
                }

                this.heartbeatFxns.forEach(fxn => fxn(this))
            }

            if (this.loopOver > 0 && this.measure > 0 && (this.measure % this.loopOver === 0)) {
              this.t = 0

              this.measure = 0
              this.beat = 0
              this.loopCount++
              // console.log("LOOPOVER")
            }

            this.lastUpdate = currentTime 

           
        }
        

    }
    
}