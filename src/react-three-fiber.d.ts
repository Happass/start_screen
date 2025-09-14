import type { ReactThreeFiber } from '@react-three/fiber'
import type { Object3D } from 'three'

declare global {
  namespace JSX {
    interface IntrinsicElements extends ReactThreeFiber.IntrinsicElements {
      primitive: Object3D
      ambientLight: JSX.IntrinsicElements['ambientLight']
      directionalLight: JSX.IntrinsicElements['directionalLight']
      meshStandardMaterial: JSX.IntrinsicElements['meshStandardMaterial']
      mesh: JSX.IntrinsicElements['mesh']
      planeGeometry: JSX.IntrinsicElements['planeGeometry']
      meshBasicMaterial: JSX.IntrinsicElements['meshBasicMaterial']
    }
  }
}