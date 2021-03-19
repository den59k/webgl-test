varying vec2 vUv;
uniform vec3 uColorA;
uniform vec3 uColorB;

void main(){
  gl_FragColor = vec4(
    mix( uColorA, uColorB, vec3(clamp(vUv.y * 2. - 1., 0., 1.))),
    1.
  );
}
