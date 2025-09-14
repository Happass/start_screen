import { Sphere } from "@react-three/drei";
import { Vector3 } from "three";

type PinProps = {
  position: Vector3;
  color?: string;
  onClick?: () => void;
  onMove?: (pos: Vector3) => void; // ← もし将来ドラッグで動かしたいなら残してOK
};

export function Pin({ position, color = "red", onClick }: PinProps) {
  return (
    <Sphere args={[0.05, 16, 16]} position={position} onClick={onClick}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
      />
    </Sphere>
  );
}