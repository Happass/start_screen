import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Vector3 } from "three";

type Props = { target: Vector3 | null };

export function CameraRig({ target }: Props) {
  const { camera } = useThree();

  useEffect(() => {
    if (target) {
      camera.position.set(target.x * 2.5, target.y * 2.5, target.z * 2.5);
      camera.lookAt(0, 0, 0);
    }
  }, [camera, target]);

  return null;
}