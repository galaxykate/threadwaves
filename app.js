/**
 * Starter code
 *
 */
/* globals Vue, p5, Tracker */
// GLOBAL VALUES, CHANGE IF YOU WANT


// calculateListOverlap(["a", "b", "c"], ["b", "c", "d", "f"])

function randomGradient(count = 10, mode) {
  let gr = {
    type: "gradient",
    pts: [],
    mode: mode || (Math.random()>.5?"HSL":"RGB")
  }
  for (var i = 0; i < count; i++) {
    let pct = i/(count-1)
    if (pct !== 0 && pct !== 1)
      pct += (Math.random() - .5)/count

    gr.pts.push({
      id: crypto.randomUUID(),
      pct,
      val: gr.mode === "RGB"?[Math.random()*255, Math.random()*255, Math.random()*255]:
        [Math.random()*360, Math.random()*40 + 60, Math.random()*100]
    })
  }
  return gr
}

function randomCurve(count = 10, min=0, max=1) {
  let curve = {
    type: "curve",
    pts: []
  }

  

  for (var i = 0; i < count; i++) {
    let pct = i/(count-1)
    if (pct !== 0 && pct !== 1)
      pct += (Math.random() - .5)/count
    curve.pts.push({
      id: crypto.randomUUID(),
      pct,
      val: Math.random()*(max-min) + min
    })
  }
  return curve
}


let testSequences = {
  
}


let app = {
  dim: [700,400], 
  tracker:new Tracker({
    mediapipePath:"/mediapipe/",
    // handLandmarkerPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/",
    // faceLandmarkerPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/",
    // poseLandmarkerPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker/float16/1/"
    handLandmarkerPath: "/mediapipe/",
    faceLandmarkerPath: "/mediapipe/",
    poseLandmarkerPath: "/mediapipe/",
    createLandmark() {
      return new Vector2D(0,0)
    }
  }),
  points: [],
  envelopes: [],
  time:new HeartBeatTime({loopOver: 3}),
  debugOptions: {
    speed: 1,
    showTrackerDebug: false,
    mode: "test"
  },
  debugOptionsOptions: {
    mode: ["test", "foo", "bar"]
  },
  curve: new AnimationCurve(),
  gradient: new Gradient(),
  experience: new Experience(),
  p: undefined,
  act: undefined,

  animation: new Animation({
    channels:{
      fill: randomGradient(),
      stroke: randomGradient(),
      radius: randomCurve(),
      aspect: randomCurve(),
      strokeWeight: randomCurve(),
    }
  }),
}



document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");

  new Vue({
    template: `<div id="app">

    <div id="main-drawing" ref="p5"></div>

    <div class="controls">
      <div v-if="act">{{act.id}}</div>

      <anim-editor v-if="true" :animation="animation" />
      <curve-editor v-if="false" :curve="curve" />
      <gradient-editor v-if="false" :gradient="gradient" />
   
    
      <motion-recorder :tracker="tracker" v-if="false" />
      <heartbeat-time :time="time"  v-if="false" />

      <flag-tracker :obj="debugOptions" id="debugOptions" :options="debugOptionsOptions"/>
    </div>
    
    

    </div>`,

    methods: {
      setup() {
        this.setAct("test")
        // this.tracker.createCaptureAndInitTracking(p)
      },

      setAct(id) {
        let act = ACTS.find(act => act.id === id)
       
        console.log("START ACT", act.id)
        this.act = act
        console.log(app)
        this.act.setup(app)

      },

      draw({p, time}) {
        p.background(190, 100, 90)

        this.time.update()

        this.experience.update(app)
        this.experience.draw(app)
        
        // Try to detect faces
        app.tracker.detect()
        if (app.debugOptions.showTrackerDebug)
          app.tracker.drawDebugData(p)
        
        this.act.draw(app)
      }
    },

    computed: {
      activeEnvelopes() {
        return this.envelopes.filter(e => e.isActive)
      }
    },

    watch: {

    },



    mounted() {

      initMidi({
        onKeyUp: (note,velocity) => {
        console.log("UP", note, velocity)
        }, 
        onKeyDown: (note,velocity) => {
           console.log("DOWN", note, velocity)
        }, 
        onFader: (id, val) => {
          console.log("FADER", id, val)
        }
      }) 

      // Basic p5
      new p5((pNew) => {
        p = pNew
        app.p = p
        
        p.setup = () => {
          p.createCanvas(...app.dim);
          p.colorMode(p.HSL);
          this.setup(app)
        };
        p.draw = () => this.draw(app)

      }, this.$refs.p5);
    },

    data() {
      return {

        ...app
      };
    },
    el: "#app",
  });
});
