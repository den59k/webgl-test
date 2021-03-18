function getPos(e){
	if(e.touches)
		e = e.touches[0]
	return [ e.clientX, e.clientY ]
}

let lastPos = null
export function getEvent (callback, callbackEnd){
	return (e) => {
		const pos = getPos(e)
		
		const move = (e) => {
			const targetPos = getPos(e)
			lastPos = targetPos
			callback(targetPos, pos)
		}
		
		if(e.touches){
			document.addEventListener('touchmove', move, { passive: true })
			document.addEventListener('touchend', (e) => { 
				
				document.removeEventListener('touchmove', move)
				callbackEnd && callbackEnd(lastPos, pos)

			}, { once: true })
		}else{
			document.addEventListener('mousemove', move)
			document.addEventListener('mouseup', (e) => {

				document.removeEventListener('mousemove', move)
				callbackEnd && callbackEnd(lastPos, pos)

			}, { once: true })
		}
	}
}