import { useFrame } from "@react-three/fiber";
import { useRef } from "react";


export default function GlassesModel(){

const mesh = useRef();


useFrame(()=>{
  
mesh.current.rotation.y += 0.01;

mesh.current.position.y =
Math.sin(Date.now()*0.002)*0.1;

})


return (

<mesh ref={mesh}>

<torusGeometry 
args={[
1,
0.08,
32,
100
]}
/>

<meshPhysicalMaterial
color="#111"
metalness={0.8}
roughness={0.2}
clearcoat={1}
/>


</mesh>

)

}