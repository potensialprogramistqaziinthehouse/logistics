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
  uniform bool uHasTexture;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // Base color: use texture if loaded, otherwise procedural ocean/land look
    vec3 baseColor;
    if (uHasTexture) {
      baseColor = texture2D(uTexture, vUv).rgb;
    } else {
      // Procedural fallback: deep blue ocean with subtle green patches
      float lat = vUv.y;
      float lon = vUv.x;
      vec3 ocean = vec3(0.05, 0.18, 0.42);
      vec3 land  = vec3(0.12, 0.32, 0.12);
      float n = fract(sin(lon * 43.0 + lat * 97.0) * 4375.5453);
      baseColor = mix(ocean, land, step(0.62, n));
    }

    // Atmosphere glow (fresnel)
    vec3 viewDir = normalize(-vPosition);
    float fresnel = 1.0 - max(dot(vNormal, viewDir), 0.0);
    fresnel = pow(fresnel, 2.5);

    // City-light shimmer on night side (subtle orange dots)
    float shimmer = fract(sin(vUv.x * 200.0 + uTime * 0.3) * sin(vUv.y * 180.0)) * 0.06;

    vec3 atmosphereColor = vec3(0.25, 0.55, 1.0);
    vec3 finalColor = mix(baseColor, atmosphereColor, fresnel * 0.5) + shimmer;

    gl_FragColor = vec4(finalColor, uOpacity);
  }
`

// Atmosphere shell rendered as a slightly larger transparent sphere
export const atmosphereVertexShader = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const atmosphereFragmentShader = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = 1.0 - max(dot(vNormal, viewDir), 0.0);
    fresnel = pow(fresnel, 3.0);
    vec3 color = vec3(0.3, 0.6, 1.0);
    gl_FragColor = vec4(color, fresnel * 0.35);
  }
`
