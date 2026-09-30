import * as THREE from "three";
import { WebGPURenderer } from "three/webgpu";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas=document.querySelector("#scene");
let renderer, scene, camera, points, ring, clock3=new THREE.Clock();

async function boot3D(){
  try{
    renderer=new WebGPURenderer({canvas,antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.setSize(innerWidth,innerHeight);
    await renderer.init();

    scene=new THREE.Scene();
    camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,100);
    camera.position.set(0,0,7);

    // procedural particle field
    const count=16000;
    const pos=new Float32Array(count*3);
    const col=new Float32Array(count*3);
    for(let i=0;i<count;i++){
      const r=1.8+Math.pow(Math.random(),.55)*7;
      const a=Math.random()*Math.PI*2;
      const z=(Math.random()-.5)*7;
      pos[i*3]=Math.cos(a)*r;
      pos[i*3+1]=Math.sin(a)*r*.55+z*.18;
      pos[i*3+2]=z;
      const c=Math.random();
      col[i*3]=.2+c*.2; col[i*3+1]=.65+c*.3; col[i*3+2]=.7+c*.3;
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
    geo.setAttribute("color",new THREE.BufferAttribute(col,3));
    const mat=new THREE.PointsMaterial({size:.018,vertexColors:true,transparent:true,opacity:.62,blending:THREE.AdditiveBlending});
    points=new THREE.Points(geo,mat);
    scene.add(points);

    // central wireframe engineering core
    const coreGeo=new THREE.IcosahedronGeometry(1.1,2);
    const coreMat=new THREE.MeshBasicMaterial({color:0x72f6ff,wireframe:true,transparent:true,opacity:.08});
    const core=new THREE.Mesh(coreGeo,coreMat);
    scene.add(core);

    ring=new THREE.Mesh(
      new THREE.TorusGeometry(1.75,.006,8,180),
      new THREE.MeshBasicMaterial({color:0xb6ff3d,transparent:true,opacity:.6})
    );
    scene.add(ring);

    // floating data nodes
    for(let i=0;i<8;i++){
      const g=new THREE.SphereGeometry(.018,8,8);
      const m=new THREE.MeshBasicMaterial({color:i%2?0xb6ff3d:0x72f6ff});
      const s=new THREE.Mesh(g,m);
      const a=i/8*Math.PI*2;
      s.position.set(Math.cos(a)*2.2,Math.sin(a)*1.25,(i%3-1)*.6);
      scene.add(s);
    }

    animate();
  }catch(e){
    document.querySelector("#mode").innerHTML="<span></span> WEBGL FALLBACK";
    fallback2D();
  }
}
function fallback2D(){
  const c=canvas.getContext("2d");
  function f(){
    c.clearRect(0,0,innerWidth,innerHeight);
    const t=performance.now()/1000;
    c.strokeStyle="rgba(124,246,255,.08)";
    for(let i=0;i<35;i++){
      const a=t*.08+i*.3;
      c.beginPath();c.arc(innerWidth*.68,innerHeight*.46,100+i*11,a,a+1.1);c.stroke();
    }
    requestAnimationFrame(f);
  }f();
}
function animate(){
  requestAnimationFrame(animate);
  const t=clock3.getElapsedTime();
  points.rotation.y=t*.018; points.rotation.x=Math.sin(t*.15)*.04;
  ring.rotation.x=1.1+Math.sin(t*.2)*.1; ring.rotation.z=t*.12;
  scene.rotation.y=Math.sin(t*.07)*.06;
  renderer.render(scene,camera);
}
addEventListener("resize",()=>{if(!renderer)return;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
boot3D();

// Boot sequence
setTimeout(()=>{const b=document.querySelector("#boot");b.style.opacity="0";b.style.visibility="hidden"},2100);

// clock
function tick(){const d=new Date();document.querySelector("#clock").textContent=d.toLocaleTimeString("en-GB",{hour12:false});}
setInterval(tick,1000);tick();

// cursor
const cur=document.querySelector(".cursor");
addEventListener("pointermove",e=>{cur.style.left=e.clientX+"px";cur.style.top=e.clientY+"px"});
document.querySelectorAll("a,button,.project-card").forEach(el=>{
  el.addEventListener("mouseenter",()=>{cur.style.width="44px";cur.style.height="44px";cur.style.background="rgba(124,246,255,.08)"});
  el.addEventListener("mouseleave",()=>{cur.style.width="24px";cur.style.height="24px";cur.style.background="transparent"});
});

// telemetry / project matrix
const projects={
 robot:{id:"P-01 // ROBOT",domain:"INDUSTRIAL ROBOTICS",stack:"ABB · ROBOTSTUDIO · MECHANICAL DESIGN",role:"TRAJECTORY + GRIPPER SYSTEM",tag:"INDUSTRIAL ROBOTICS",title:"ABB REPLACEMENT",copy:"During a 3-month internship at Saint-Gobain Sekurit Maroc, the project involved replacing an older ABB robot with a new robot, creating its trajectory and developing a gripping system for large glass parts.",points:"TRAJECTORY CREATION<br>ROBOT PROGRAMMING WORKFLOW<br>GLASS HANDLING / GRIPPER CONCEPT"},
 home:{id:"P-02 // EMBEDDED",domain:"SMART HOME / EMBEDDED",stack:"RASPBERRY PI · ARDUINO · ELECTRONICS",role:"HOME AUTOMATION SYSTEM",tag:"EMBEDDED / IOT",title:"SMART HOME",copy:"A hands-on home automation project combining Raspberry Pi and Arduino to connect electronics, control logic and automated functions.",points:"RASPBERRY PI<br>ARDUINO<br>AUTOMATION LOGIC"},
 future:{id:"P-03 // NEXT",domain:"INTELLIGENT SYSTEMS",stack:"AUTOMATION · EMBEDDED · AI",role:"EXPLORATION",tag:"NEXT SYSTEM",title:"BUILDING THE NEXT",copy:"A space for future engineering work: intelligent machines, automation, embedded technologies and human-machine interfaces.",points:"SYSTEMS THINKING<br>EXPERIMENTATION<br>FUTURE TECHNOLOGY"}
};
const modal=document.querySelector("#modal");
document.querySelectorAll(".project-card").forEach(card=>{
 card.addEventListener("click",()=>{
   document.querySelectorAll(".project-card").forEach(x=>x.classList.remove("active"));card.classList.add("active");
   const p=projects[card.dataset.project];
   ["project-id","t-domain","t-stack","t-role"].forEach((id,i)=>document.getElementById(id).textContent=[p.id,p.domain,p.stack,p.role][i]);
   document.querySelector("#m-tag").textContent=p.tag;
   document.querySelector("#m-title").textContent=p.title;
   document.querySelector("#m-copy").textContent=p.copy;
   document.querySelector("#m-points").innerHTML=p.points;
   modal.classList.add("open");
 });
});
document.querySelector("#close").onclick=()=>modal.classList.remove("open");
modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.remove("open")});

// telemetry waveform
const wc=document.querySelector("#wave"),ctx=wc.getContext("2d");
function wave(){
 wc.width=wc.clientWidth*devicePixelRatio;wc.height=wc.clientHeight*devicePixelRatio;
 ctx.scale(devicePixelRatio,devicePixelRatio);const w=wc.clientWidth,h=wc.clientHeight,t=performance.now()/500;
 ctx.clearRect(0,0,w,h);ctx.strokeStyle="rgba(124,246,255,.55)";ctx.lineWidth=1;ctx.beginPath();
 for(let x=0;x<w;x++){const y=h/2+Math.sin(x*.035+t)*7+Math.sin(x*.11-t*1.7)*3+(Math.random()-.5)*2;ctx.lineTo(x,y)}ctx.stroke();
 requestAnimationFrame(wave);
}wave();

// reveal
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.style.transform="translateY(0)",e.target.style.opacity="1"}),{threshold:.08});
document.querySelectorAll(".section-head,.cap-grid article,.project-card,.profile-grid").forEach(el=>{el.style.opacity="0";el.style.transform="translateY(25px)";el.style.transition="opacity .8s,transform .8s";io.observe(el)});
