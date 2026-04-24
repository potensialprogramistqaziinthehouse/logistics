export function SceneLighting() {
  return (
    <>
      {/* Soft fill */}
      <ambientLight intensity={0.35} />

      {/* Key light — top right, warm */}
      <directionalLight
        position={[8, 10, 5]}
        intensity={1.4}
        color="#fff8f0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Rim light — left back, cool blue for the car */}
      <directionalLight
        position={[-6, 4, -4]}
        intensity={0.8}
        color="#4f9eff"
      />

      {/* Under-glow — orange accent matching brand */}
      <pointLight
        position={[3.5, -1.5, 1]}
        intensity={1.2}
        color="#ff6b35"
        distance={6}
      />

      {/* Globe fill — blue from below */}
      <pointLight
        position={[-3, -3, 2]}
        intensity={0.5}
        color="#4f9eff"
        distance={8}
      />
    </>
  )
}
