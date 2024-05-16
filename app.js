/**
 * Starter code
 *
 */
/* globals Vue, p5, Tracker */
// GLOBAL VALUES, CHANGE IF YOU WANT


NOTE_COUNT = 3


let app = {
  dim: [1900,1100], 
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

  time:new HeartBeatTime({loopOver: 300}),

  debugOptions: {
    speed: 1,
    actIndex:1,
    showTrackerDebug: false,
    detect: false,
    showCapture: true
  },
  debugOptionsOptions: {
    actIndex: [0,1,2,3,4,5,6,7,8,9]
  },

  sharedParticles: undefined,
  animations: [],

  acts: [ActTest, ActCarl, ActHistory, ActWind, ActThreads],

  p: undefined,
  act: undefined,


  startAct(index) {

    this.debugOptions.actIndex = (index%this.acts.length)
    let actClass = this.acts[index]


    if (actClass) {
      // console.log("Start", actClass, this.actIndex)

      // Animation for the new act
      let act = new actClass()
      let anim = new Animation({time:this.time, id: act.toString(), smooth: true})
      console.log("------------------\nSTART ACT " + act)

      act.start(app)
      anim.attack()

      anim.payload.push(act)

      // Decay any existing animations
      this.animations.forEach(anim => {
        anim.release({
          t: 2
        })
      })
      this.animations.push(anim)
      
    }
  }

}



document.addEventListener("DOMContentLoaded", (event) => {


  new Vue({
    template: `<div id="app">
    <div class="background-holder"></div>
    <div id="main-drawing" ref="p5" class="p5-holder overlay"></div>
    <div id="second-drawing" ref="pTop" class="p5-holder overlay"></div>

    <div class="controls">
      <button @click="midiKick(0)">MIDI KICK 0</button>
      <button @click="midiKick(1)">MIDI KICK 1</button>
      <button @click="midiKick(2)">MIDI KICK 2</button>
      <!-- act data --> 
      <div>
        <table>
          <tr :class="anim.cssClasses" v-for="anim in app.animations">
            <td>
              {{anim.id}}
            </td>
            <td>
              {{anim.state}}:{{anim.pct.toFixed(2)}}
            </td>
          </tr>
        </table>
      </div>  
      <flag-tracker 
        id="debugOptions" 
        :obj="app.debugOptions" 
        :options="app.debugOptionsOptions"
        />
    
      
      <anim-editor v-if="false" :animation="animation" />
      <curve-editor v-if="false" :curve="curve" />
      <gradient-editor v-if="false" :gradient="gradient" />
   
    
      <motion-recorder :tracker="app.tracker" v-if="false" />
      <heartbeat-time :time="app.time"  v-if="false" />

    </div>

    <div>
      
      <image-frame v-for="img in images" :img="img" :key="img.idNumber" />
      
    </div>
  
    </div>
    </div>`,

    methods: {
      midiKick(index) {
        console.log("midi kick", index)
        this.acts.forEach(act => act.kick(index))
      },


      setup() {
        
        app.sharedParticles = new ParticleSystem({
          count:40,
          postCreate: (pt) => {
            pt.setToRandom(0, p.width, 0, p.height)
          }
        })
        
        app.startAct(app.debugOptions.actIndex)

        // Test the starting act
        // for (var i = 0; i < 10; i++) {
        //   setTimeout(() => {
        //     app.startAct(app.debugOptions.actIndex)
        //   }, i*1500)
        
        // }


        this.app.tracker.createCaptureAndInitTracking(p, 1)
      },

      update({p, time}) {
          //----------------
        // UPDATE
        app.time.update()

        // update all the shared particle systems
        
      
        if (app.debugOptions.detect === true) {
          app.tracker.detect()
        }
        
        app.sharedParticles.clearForces()

        // Apply a bunch of forces
        app.animations.forEach(anim => anim.update(app))

        app.sharedParticles.move({p,time, dt: time.dt})

       
      },


      draw({p, time}) {

        // reduceAlpha(p, .05)
        // Cleanup
        app.animations = app.animations.filter(anim => !anim.isDead)

        
      
        
        //----------------
        // DRAW

        let layers = ["bg", "main", "accent"]

        layers.forEach(layer => {
          
          app.animations.forEach(anim => anim.draw({
            p:layer==="accent"?app.pTop:app.p,
            time, layer:layer}))
        })
        
        // Try to detect faces

        if (app.debugOptions.detect === true) {
          
          if (app.debugOptions.showTrackerDebug)
            app.tracker.drawDebugData(p)
        }

        // app.sharedParticles.drawDebug({p:app.pTop})
        // console.log()

        p.push()
        p.scale(4, 4)

        if (app.tracker.isActive && app.debugOptions.showCapture) {
          p.image(app.tracker.capture, 30, 30)
        }

        p.pop()
      }
    },

    computed: {
      images() {
        // console.log("images")
        if (this.app.sharedParticles) {
          let hasImage = this.app.sharedParticles.pts.filter(pt => pt.image !== undefined)
          let images = hasImage.map(pt => pt.image)
          return images
        }
        return []
      },

      acts() {
        let acts = []
        app.animations.forEach(anim => {
          acts = acts.concat(anim.payload)
        })
        console.log(acts)
        return acts
      }
      
    },

    watch: {

    },



    mounted() {

      initMidi({
        onKeyUp: ({note,velocity}) => {
        // console.log("UP", note, velocity)

        }, 
        onKeyDown: ({note,velocity}) => {
           console.log("DOWN", note, velocity)
           this.midiKick(note%NOTE_COUNT)
        }, 
        onFader: ({id, val}) => {
          // console.log("FADER", id, val)
        }
      }) 

      // Make the main canvas
      new p5((pNew) => {
        p = pNew
        app.p = p

         p.keyPressed = (ev) => {
          console.log(p.key)
           let num = parseInt(p.key)

           if (!isNaN(num)) {
              app.startAct(num)
           } else {
            if (p.key === "c") {
              app.debugOptions.showCapture = !app.debugOptions.showCapture
            }
           }
         }
        
        
        p.setup = () => {
          p.createCanvas(...app.dim);
          p.colorMode(p.HSL);
          this.setup(app)
        };

        p.draw = () => {
          this.update(app)
          this.draw(app)
        }

      }, this.$refs.p5);

      // Make the second top-canvas
      new p5((pNew) => {
        // p = pNew
        app.pTop = pNew
        pNew.setup = () => {
          pNew.createCanvas(...app.dim);
          pNew.colorMode(p.HSL);
          
        };
      }, this.$refs.pTop);
    },

    data() {
      return {

        app
      };
    },
    el: "#app",
  });
});
