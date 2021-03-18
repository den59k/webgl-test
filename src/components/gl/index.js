import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'

export default function WebGLViewer(){

	const ref = useRef()

	useEffect(() => {
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

		const _renderer = new THREE.WebGLRenderer({ alpha: true } );
		_renderer.setSize( window.innerWidth, window.innerHeight );
		ref.current.appendChild(_renderer.domElement )
		
		const renderer = new EffectComposer(_renderer)

		const renderPass = new RenderPass( scene, camera );
		renderer.addPass( renderPass );

		const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0, 0.8)
		renderer.addPass( bloomPass );

		const light = new THREE.AmbientLight( 0x404040);
		const directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
		directionalLight.position.set(0, 1, 1)
		scene.add( light, directionalLight );

		camera.position.set(0, 1, 4);
		
		const loader = new GLTFLoader();

		loader.load('/models/priora.glb', gltf => {
			scene.add(gltf.scene)
			
			const animate = () => {

				gltf.scene.children[0].rotation.y += 0.01

				renderer.render();
				requestAnimationFrame(animate)
			}

			animate()
		})
	
		renderer.render();

	}, [])

	return (
		<div ref={ref}></div>
	)
}