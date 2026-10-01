"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import GlassesModel from "./GlassesModel";

export default function Loader(){

return (

<div className="fixed inset-0 bg-white z-50">

<Canvas camera={{position:[0,0,5]}}>

<ambientLight intensity={2}/>

<directionalLight 
position={[2,3,4]}
intensity={3}
/>


<GlassesModel/>


<OrbitControls
enableZoom={false}
/>


</Canvas>


</div>

)

}