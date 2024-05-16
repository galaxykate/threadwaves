function glitterFade({p, t, scatter=0, scatterFalloff= 1, 	
	hueNoise= 0, hueScatter=0,
	color:[h, s, l], opacity=1, radius=10, count=4, 
	pts, minRadius, wiggle=0, starPoints=0}) {
	// console.log(anim.pct)
	
	if (!pts)
		pts = new Array(count).fill(undefined);

	p.noStroke()
	let r = radius
	
	
	pts.forEach((pt,index) => {
		let x = p.width*(.4 + .5*noise(t + 100 + index))
		let y = p.height*(.4 + .5*noise(t + 200 + index*200))

		let wiggle = Math.random()*radius

		if (pt) {
			x = pt.x
			y = pt.y 
		}

		let theta = Math.random()*100
		let r = Math.random()**scatterFalloff *scatter
		x += r*Math.cos(theta)
		y += r*Math.sin(theta)
		// console.log(x, y)

		let scale = .001

		let h2 = h
		if (hueNoise) {
			h = (36000 + h + hueNoise*noise(x*scale, y*scale, t))%360
		}
		
		
		let pastel = (.5 + Math.random()*.4)*l
		let sat = s

	
		splot({p, x, y, color:[h,s,l], radius, minRadius, starPoints, opacity, t})
	})

	// p.fill(h, 100, 90, anim.pct*.01)
	// p.rect(0, 0, p.width, p.height)
}


function splot({p, x, y, count=5, color:[h, s, l], opacity=1, 
	radius, index, t, falloff=1, wiggle=0, minRadius=3, starPoints=0,

}) {
	for (var i = 0; i < count; i++) {

		// [1-0]
		let pct0 = i/(count - 1)
		let pct1 = 1 - i/(count - 1)

		let alpha = opacity*(pct0)
		// alpha = .2
		// console.log(alpha)
		p.fill(h, s, lerp(l, 100, pct0), alpha)
		let r = radius*(pct1**falloff) + minRadius

		let wx = Math.random()*wiggle*radius
		let wy = Math.random()*wiggle*radius
		// console.log(x, y, wiggle, radius, r)
			
		if (starPoints) {
			p.beginShape()

			for (let j = 0; j < starPoints*2; j++) {
				let theta = Math.PI*j/starPoints

				let r = (j%2)*radius*(1 + 1*noise(t + x*.01, j + t + y*.02))*(1 - .9*pct1) + minRadius*(1 + 2*pct1)
				p.vertex(x + r*Math.cos(theta), y + r*Math.sin(theta))
			}
			p.endShape()
		} else {
			p.circle(x + wx, y + wy, r)
		
		}
	}
}



