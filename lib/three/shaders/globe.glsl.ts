export const globeVertexShader = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const globeFragmentShader = /* glsl */`
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec4 texColor = texture2D(uTexture, vUv);

    // Atmosphere glow effect based on view angle
    vec3 viewDir = normalize(-vPosition);
    float fresnel = 1.0 - max(dot(vNormal, viewDir), 0.0);
    fresnel = pow(fresnel, 2.0);

    // Atmosphere color (blue glow)
    vec3 atmosphereColor = vec3(0.31, 0.61, 1.0);
    vec3 finalColor = mix(texColor.rgb, atmosphereColor, fresnel * 0.4);

    gl_FragColor = vec4(finalColor, uOpacity);
  }
`
