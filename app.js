import {generateToolpath,toolpathMetrics,gcodeFor} from './toolpath.js';

const canvas=document.getElementById('cncCanvas'),ctx=canvas.getContext('2d');
let profile='circle';
const ui={
 length:document.getElementById('length'),width:document.getElementById('width'),depth:document.getElementById('depth'),tool:document.getElementById('tool'),step:document.getElementById('step'),feed:document.getElementById('feed'),rpm:document.getElementById('rpm'),
 lengthOut:document.getElementById('lengthOut'),widthOut:document.getElementById('widthOut'),depthOut:document.getElementById('depthOut'),toolOut:document.getElementById('toolOut'),stepOut:document.getElementById('stepOut'),feedOut:document.getElementById('feedOut'),rpmOut:document.getElementById('rpmOut'),
 toolpathLength:document.getElementById('toolpathLength'),cycleTime:document.getElementById('cycleTime'),rapidDistance:document.getElementById('rapidDistance'),depthPasses:document.getElementById('depthPasses')
};
function values(){return{length:Number(ui.length.value),width:Number(ui.width.value),depth:Number(ui.depth.value),toolDiameter:Number(ui.tool.value),stepOver:Number(ui.step.value),profile,feed:Number(ui.feed.value),rpm:Number(ui.rpm.value)}}
function sync(){
 ui.lengthOut.textContent=ui.length.value;ui.widthOut.textContent=ui.width.value;ui.depthOut.textContent=ui.depth.value;ui.toolOut.textContent=ui.tool.value;ui.stepOut.textContent=ui.step.value;ui.feedOut.textContent=ui.feed.value;ui.rpmOut.textContent=ui.rpm.value;
 update();
}
function update(){
 const v=values(),{paths,depthPasses}=generateToolpath(v),metrics=toolpathMetrics({...v,...v,paths});
 ui.toolpathLength.textContent=`${metrics.cuttingLength.toFixed(0)} mm`;
 ui.cycleTime.textContent=`${(metrics.cycleSeconds/60).toFixed(1)} min`;
 ui.rapidDistance.textContent=`${metrics.rapidDistance.toFixed(0)} mm`;
 ui.depthPasses.textContent=depthPasses;
 draw(paths,v);
}
function draw(paths,v){
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#091522';ctx.fillRect(0,0,canvas.width,canvas.height);
 const margin=60,scale=Math.min((canvas.width-2*margin)/v.length,(canvas.height-2*margin)/v.width),ox=(canvas.width-v.length*scale)/2,oy=(canvas.height-v.width*scale)/2;
 ctx.fillStyle='#1b3142';ctx.strokeStyle='#60798a';ctx.lineWidth=2;ctx.fillRect(ox,oy,v.length*scale,v.width*scale);ctx.strokeRect(ox,oy,v.length*scale,v.width*scale);
 ctx.strokeStyle='#58d6c7';ctx.lineWidth=2;
 for(const path of paths){if(path.length<2)continue;ctx.beginPath();path.forEach((p,i)=>{const x=ox+p.x*scale,y=oy+p.y*scale;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke()}
 ctx.fillStyle='#ffad66';ctx.strokeStyle='#fff';ctx.lineWidth=2;const toolR=v.toolDiameter*scale/2;ctx.beginPath();ctx.arc(ox+v.length*0.5*scale,oy+v.width*0.5*scale,toolR,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.fillStyle='#b1c1cf';ctx.font='12px Inter, sans-serif';ctx.fillText(`${v.length} mm`,canvas.width/2,canvas.height-18);ctx.save();ctx.translate(18,canvas.height/2);ctx.rotate(-Math.PI/2);ctx.fillText(`${v.width} mm`,0,0);ctx.restore();
}
[ui.length,ui.width,ui.depth,ui.tool,ui.step,ui.feed,ui.rpm].forEach(el=>el.addEventListener('input',sync));
document.querySelectorAll('.profile-buttons button').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.profile-buttons button').forEach(b=>b.classList.remove('active'));button.classList.add('active');profile=button.dataset.profile;update()}));
document.getElementById('downloadGcode').addEventListener('click',()=>{const blob=new Blob([gcodeFor(values())],{type:'text/plain'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='contour_program.nc';a.click();URL.revokeObjectURL(url)});
sync();
