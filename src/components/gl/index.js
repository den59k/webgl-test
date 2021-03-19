import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass'
import { getEvent } from 'libs/mouse-event'

import gradientVert from 'shaders/gradient.vert'
import gradientFrag from 'shaders/gradient.frag'



function enableShadow(obj){
	obj.castShadow = true
	obj.children.forEach(enableShadow)
}

function toColor (color){
	return new THREE.Color(color)
}

export default function WebGLViewer(){

	const ref = useRef()

	const [ state, setState ] = useState({})
	const [ cameraState, setCameraState ] = useState({ rotation: [0, 0, 0], distance: 5 })

	useEffect(() => {
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
		
		const _renderer = new THREE.WebGLRenderer({ alpha: true } );
		_renderer.setSize( window.innerWidth, window.innerHeight );
		_renderer.shadowMap.enabled = true	
		_renderer.shadowMap.type = THREE.PCFSoftShadowMap	
		
		const renderer = new EffectComposer(_renderer)
		
		const renderPass = new RenderPass( scene, camera );
		renderer.addPass( renderPass );


		const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0, 0.8)
		renderer.addPass( bloomPass );

		const light = new THREE.AmbientLight( "E3B1B0", 1.5);
		const directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
		directionalLight.position.set(0.5, 1, 0.7)
		directionalLight.castShadow = true

		directionalLight.shadow.mapSize.width = 1024; // default
		directionalLight.shadow.mapSize.height = 1024; // default
		directionalLight.shadow.camera.near = 0.2; // default
		directionalLight.shadow.camera.far = 500; // default

		scene.add( light, directionalLight );

		const material = new THREE.ShaderMaterial( {
				uniforms: {
					uColorA: { value: toColor("#B630A9") },
					uColorB: { value: toColor("#32008A") }
				},
				vertexShader: gradientVert,
				fragmentShader: gradientFrag
			} 
		);


		const myGradient = new THREE.Mesh( new THREE.BoxGeometry( 2, 2, 2 ), material );
		myGradient.material.depthWrite = false
		myGradient.renderOrder = -99999
		scene.add(myGradient)
		
		setState({ renderer, camera, scene })
		
		const loader = new GLTFLoader();

		loader.load('/models/priora.glb', gltf => {
			scene.add(gltf.scene)

			enableShadow(gltf.scene.children[0])
			gltf.scene.children[1].receiveShadow = true

			console.log(gltf.scene)

			renderer.render()
		})
		
		renderer.render();

		ref.current.appendChild(_renderer.domElement )
		
		return () => _renderer.domElement.remove()

	}, [])

	useEffect(() => {
		if(!state.camera) return
		const fwd = new THREE.Vector3(0, 0, 1)
		const euler = new THREE.Euler(...cameraState.rotation, 'YXZ')
		
		state.camera.rotation.set(...euler.toArray())

		const matrix = new THREE.Matrix4()
		matrix.makeRotationFromEuler(euler)
		matrix.setPosition(0, 0.2, 0)

		state.camera.position.set(...fwd.applyMatrix4(matrix).multiplyScalar(cameraState.distance).toArray())

		state.renderer.render()

	}, [ cameraState, state ])

	const mouseMove = (targetPos, pos) => {
		const delta = [ targetPos[0]-pos[0], targetPos[1]-pos[1] ]

		setCameraState({ 
			...cameraState, 
			rotation: [ cameraState.rotation[0] - delta[1]*0.003, cameraState.rotation[1] - delta[0]*0.004, 0 ] 
		})
	}

	return (
		<div ref={ref} onMouseDown={getEvent(mouseMove)} onTouchStart={getEvent(mouseMove)}></div>
	)
}