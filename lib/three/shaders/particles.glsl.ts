export const particleVertexShader = /* glsl */`
  uniform float uTime;
  uniform float uScrollProgress;
  attribute float aSize;
  attribute float aPhase;

  void main() {
    vec3 pos = position;

    // Sinusoidal drift
    pos.x += sin(uTime * 0.4 + aPhase) * 0.3;
    pos.y += cos(uTime * 0.3 + aPhase * 1.3) * 0.2;
    pos.z += sin(uTime * 0.5 + aPhase * 0.7) * 0.15;

    // Fade upward on scroll
    pos.y += uScrollProgress * 8.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

export const particleFragmentShader = /* glsl */`
  uniform float uScrollProgress;

  void main() {
    // Circular point shape
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    float alpha = (1.0 - uScrollProgress) * (1.0 - dist * 2.0);
    gl_FragColor = vec4(0.31, 0.61, 1.0, alpha * 0.7);
  }
`
