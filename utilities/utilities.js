// Utilities


// ---------------------------------------------------
// ---------------------------------------------------
// ---------------------------------------------------
// Colors

function hexToHSL(H) {
  // Convert hex to RGB first
  let r = 0,
    g = 0,
    b = 0;
  if (H.length == 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length == 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);
  return [h, s, l];
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2,
    r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  // Having obtained RGB, convert channels to hex
  r = Math.round((r + m) * 255).toString(16);
  g = Math.round((g + m) * 255).toString(16);
  b = Math.round((b + m) * 255).toString(16);

  // Prepend 0s, if necessary
  if (r.length == 1) r = "0" + r;
  if (g.length == 1) g = "0" + g;
  if (b.length == 1) b = "0" + b;

  return "#" + r + g + b;
}

function hexToRGB(hex) {
    // Remove the "#" if it exists
    hex = hex.replace(/^#/, '');

    // Parse the hex string into integer values for red, green, and blue
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return [r,g,b]
}


function rgbToHex(r, g, b) {
    // Convert each component to a hex string
    const toHex = (color) => {
        // Convert the number to a hex string using toString(16)
        // and pad with a leading zero if necessary
        return Math.floor(color).toString(16).padStart(2, '0');
    };

    // Concatenate the hex strings for red, green, and blue with a "#" at the start
    return "#" + toHex(r) + toHex(g) + toHex(b);
}

// ---------------------------------------------------
// ---------------------------------------------------
// ---------------------------------------------------
// ---------------------------------------------------

// Useful fxns
function remap(v, v0, v1, nv0, nv1) {
    let pct = (v - v0)/(v1 - v0)
    return pct*(nv1 - nv0) + nv0
}

function remapArray(v, v0, v1, nv0, nv1) {
    let pct = (v - v0)/(v1 - v0)
    let dim = nv0.length

    let arr = []
    for (var i = 0; i < dim; i++) {
        arr[i] = pct*(nv1[i] - nv0[i]) + nv0[i]
    }
    return arr
}

let noise = (() => {
    let noiseFxn = new SimplexNoise(0)
    return function noiseAny() {
        if ( arguments.length == 1)
            return noiseFxn.noise2D(arguments[0],0)
        if ( arguments.length == 2)
            return noiseFxn.noise2D(arguments[0],arguments[1])
        if ( arguments.length == 3)
            return noiseFxn.noise3D(arguments[0],arguments[1],arguments[2])
        if ( arguments.length == 4)
            return noiseFxn.noise4D(arguments[0],arguments[1],arguments[2], arguments[3])
        return 0
    }
})()


function convertToFixedPrecision(obj, precision, multiline) {
  // Helper function to recursively convert floating-point numbers to fixed precision
  function convert(obj) {
    if (typeof obj === 'number' && !Number.isInteger(obj)) {
      return parseFloat(obj.toFixed(precision));
    } else if (Array.isArray(obj)) {
      return obj.map(item => convert(item));
    } else if (typeof obj === 'object' && obj !== null) {
      const newObj = {};
      for (let key in obj) {
        newObj[key] = convert(obj[key]);
      }
      return newObj;
    } else {
      return obj;
    }
  }

  // Convert the object
  const objWithFixedPrecision = convert(obj);
  
  // Now stringify the object
  return objWithFixedPrecision
}

function customStringify(data) {
  return JSON.stringify(data, (key, value) => {
    if (Array.isArray(value)) {
      return '[' + value.map(val => JSON.stringify(val)).join(',') + ']';
    }
    return value;
  }, 2);
}

function makeP5Draggable({p, range=10, remove, move, getDraggable, dblclick, click, pickup, drop, drag, hoverEnter, hoverExit}) {
    function inWindow() {
        return p.mouseX >= 0 && p.mouseY >= 0 && p.mouseX <= p.width && p.mouseY <= p.height
    }

    function getClosest() {
       let objs = getDraggable()

       let minDist = range
       let winner = undefined
       objs.forEach(obj => {
            let d = Math.sqrt((p.mouseX - obj.x)**2 + (p.mouseY - obj.y)**2)
            if (obj.radius)
                 d -= obj.radius
             if (d < minDist) {
                minDist = d
                winner = obj
             }

       })
       return winner
    }

    p.keyPressed = () => {
        if (p.keyCode === 8 || p.keyCode === 46)
            remove?.(getClosest())
    }

    p.mousePressed = () => {
        if (inWindow())
            pickup?.(getClosest())
    }

    p.mouseReleased = () => {
        drop?.(getClosest())
    }

    p.mouseDragged = () => {
        drag?.()
    }

    p.mouseClicked = () => {
        if (inWindow())
            click?.(getClosest())
    }

    p.doubleClicked = () => {
        if (inWindow())
            dblclick?.(getClosest())
    }

    p.mouseMoved = () => {

        if (inWindow()) {
            
            // Get the closest
            let closest = getClosest()
            if (p.hoveredObject !== closest) {
                
                hoverExit?.(p.hoveredObject)
                hoverEnter?.(closest)
                p.hoveredObject = closest
            }

            move?.(closest)
        } 
    }
}


function getAtSequence(pts, pct) {
    if (pts.length === 0)
        throw("No points")


    let pt0,pt1
    
    for (var i = 0; i < pts.length; i++) {
        pt0 = pts[i - 1]
        pt1 = pts[i]
        if (pct < pt1.pct) {
            if (i === 0) {
                // Off the beginning
                
                return lerpSequencePoints(pt1, pt1, 0)
            }

            let subPct = (pct - pt0.pct)/(pt1.pct - pt0.pct)
            return lerpSequencePoints(pt0, pt1, subPct)
        }
    }

    return lerpSequencePoints(pt1, pt1, 0)
}

function calculateListOverlap(a, b) {
    const setA = new Set(a);
    const setB = new Set(b);

    const aOnly = a.filter(item => !setB.has(item));
    const bOnly = b.filter(item => !setA.has(item));
    const both = a.filter(item => setB.has(item));

    return {
        a: aOnly,
        b: bOnly,
        both
    }
}


function mapObject(obj, fxn, skipUndefined) {

  let obj2 = {}
  for (var key in obj) {
    let val =  fxn(obj[key], key)
    if (val !== undefined || !skipUndefined)
      obj2[key] = val
  }
  return obj2
}


function mapObjectToArray(obj, fxn, skipUndefined) {

  let arr = Object.keys(obj).map(key => fxn(obj[key], key))
  if (skipUndefined)
    arr = arr.filter(x => x !== undefined)
  return arr
}


function lerp(v0, v1, pct) {
    if (v0 === undefined)
        throw("No value for v0 in lerp")
    if (v1 === undefined)
        throw("No value for v1 in lerp")
    if (pct === undefined)
        throw("No value for pct in lerp")
    if (typeof v0 === 'number')
        return (v1 - v0)*pct + v0
    if (Array.isArray(v0)) {
        return v0.map((v, i) => (v1[i] - v0[i])*pct + v0[i])
    }
    if (typeof v0 === 'object') {
        let obj = mapObject(v0, (val, key) => (v1[key] - v0[key])*pct + v0[key])
        return obj
    }
}


function lerpSequencePoints(pt0, pt1, pct) {
    if (pt0 === undefined)
        throw("No value for pt0 in lerp")
    if (pt1 === undefined)
        throw("No value for pt1 in lerp")
    if (pct === undefined)
        throw("No value for pct in lerp")
    
    let v0 = pt0.val
    let v1 = pt1.val
    
    return lerp(v0, v1, pct)
}

function constrain(x, min, max) {
    return Math.min(max, Math.max(x, min))
}

function lerpColors(c0, c1, pct) {
    if (!c0)
        console.warn("Not a color", c0)
    if (!c1)
        console.warn("Not a color", c1)
    return [lerp(c0[0], c1[0], pct),
        lerp(c0[1], c1[1], pct),
        lerp(c0[2], c1[2], pct)]
}


function objToInlineStyle(styleObj) {
  // FROM GPT
    // Define a mapping of style properties that should use HSL notation
    const hslProperties = ['background-color', 'color', 'border-color'];

    // Initialize the inline style string
    let inlineStyle = '';

    // Loop through the properties in the style object
    for (const property in styleObj) {
        if (styleObj.hasOwnProperty(property)) {
            const value = styleObj[property];

            // Check if the property should use HSL notation
            if (hslProperties.includes(property)) {
                if (Array.isArray(value) && value.length === 3) {
                    // Convert the array to an HSL color string
                    const hslColor = `hsl(${value[0]}, ${value[1]}%, ${value[2]}%)`;
                    inlineStyle += `${property}: ${hslColor}; `;
                }
            } else {
                // Use pixel units for other properties
                inlineStyle += `${property}: ${value}px; `;
            }
        }
    }

    return inlineStyle;
}


function map(x, y0, y1, z0, z1) {
    let pct = (x - y0)/(y1 - y0) 
    return pct*(z1-z0) + z0
}


// https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
const saveTemplateAsFile = (filename, dataObjToWrite) => {
  const blob = new Blob([JSON.stringify(dataObjToWrite)], {
    type: "text/json",
  });
  const link = document.createElement("a");

  link.download = filename;
  link.href = window.URL.createObjectURL(blob);
  link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");

  const evt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });

  link.dispatchEvent(evt);
  link.remove();
};

function oneHotFromLabels(label, labels) {
  let index = labels.indexOf(label);
  if (index < 0) console.warn(`No label '${label}' found in labels: ${labels}`);
  let arr = new Array(labels.length).fill(0);
  arr[index] = 1;
  return arr;
}

function oneHot(count, index) {
  let arr = new Array(count).fill(0);
  arr[index] = 1;
  return arr;
}

function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }

  return maxIndex;
}

function predictionToClassification(labels, rawPrediction) {
  // Make the ML5 prediction into something more useable
  let classification = {
    scoresByLabel: {},
    sorted: [],
  };

  rawPrediction.forEach((option, index) => {
    let label = labels[index];
    classification.scoresByLabel[label] = option.value;
    classification.sorted.push({
      label,
      score: option.value,
    });
  });
  classification.sorted.sort((a, b) => b.score - a.score);
  classification.winner = classification.sorted[0]
  return classification
}
