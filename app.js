/**
 * Starter code
 *
 */
/* globals Vue, p5, Tracker */
// GLOBAL VALUES, CHANGE IF YOU WANT


// calculateListOverlap(["a", "b", "c"], ["b", "c", "d", "f"])

let app = {
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
  experience: new Experience()
}



document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");

  new Vue({
    template: `<div id="app">

    <div id="main-drawing" ref="p5"></div>

    <div class="controls">
     
      <curve-editor v-if="true" :curve="curve" />
   
      <gradient-editor v-if="true" :gradient="gradient" />
   
    
      <motion-recorder :tracker="tracker" v-if="false" />
      <heartbeat-time :time="time"  v-if="false" />

      <flag-tracker :obj="debugOptions" id="debugOptions" :options="debugOptionsOptions"/>
    </div>
    
    

    </div>`,

    methods: {

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

      // Create a p5 object for whatever
      new p5((pNew) => {
        p = pNew

      

        // We have a new "p" object representing the sketch

        this.capture;
        p.setup = () => {
          p.createCanvas(600, 500);
          p.colorMode(p.HSL);
          // this.tracker.createCaptureAndInitTracking(p)
         
        };

        p.draw = () => {
          p.background(190, 100, 90)

          this.time.update()

          this.experience.update(app)
          this.experience.draw(app)
          
          // Try to detect faces
          app.tracker.detect()

          if (app.debugOptions.showTrackerDebug)
            app.tracker.drawDebugData(p)
          


        };
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
