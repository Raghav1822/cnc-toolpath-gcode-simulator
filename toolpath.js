export function clamp(value, min, max){return Math.max(min,Math.min(max,value))}

export function generateToolpath({length,width,depth,toolDiameter,stepOver,profile}) {
  const r = Math.min(length,width) / 2 - toolDiameter;
  const cx = length/2, cy = width/2;
  const spacing = toolDiameter * stepOver/100;
  const paths=[];
  const depthPasses=Math.max(1,Math.ceil(depth/4));
  for(let pass=0;pass<depthPasses;pass++){
    const z=-Math.min(depth,(pass+1)*4);
    if(profile==='circle'){
      for(let offset=spacing;offset<=r;offset+=spacing){
        const rr=r-offset+toolDiameter/2;
        if(rr<=0) continue;
        const points=[];
        for(let i=0;i<=72;i++){const a=i/72*2*Math.PI;points.push({x:cx+rr*Math.cos(a),y:cy+rr*Math.sin(a),z})}
        paths.push(points);
      }
    }else if(profile==='slot'){
      const slotLength=Math.max(20,length-2*toolDiameter);
      const slotWidth=Math.max(12,width*0.35);
      for(let y=cy-slotWidth/2;y<=cy+slotWidth/2;y+=spacing){
        if(y===cy-slotWidth/2)paths.push([{x:cx-slotLength/2,y:y,z},{x:cx+slotLength/2,y:y,z}]);
        else paths.push([{x:cx-slotLength/2,y:y,z},{x:cx+slotLength/2,y:y,z}]);
      }
    }else{
      const inset=toolDiameter;
      for(let offset=spacing;offset<Math.min(length,width)/2-inset;offset+=spacing){
        paths.push([
          {x:inset+offset,y:inset+offset,z},
          {x:length-inset-offset,y:inset+offset,z},
          {x:length-inset-offset,y:width-inset-offset,z},
          {x:inset+offset,y:width-inset-offset,z},
          {x:inset+offset,y:inset+offset,z}
        ]);
      }
    }
  }
  return {paths,depthPasses};
}

export function toolpathMetrics({paths,feed,rapidRate=3000,length,width,toolDiameter}) {
  let cutting=0, rapid=0;
  let last={x:length/2,y:width/2,z:5};
  for(const path of paths){
    for(const point of path){
      const dx=point.x-last.x,dy=point.y-last.y,dz=point.z-last.z;
      const distance=Math.sqrt(dx*dx+dy*dy+dz*dz);
      if(last.z>0 || point.z!==last.z) rapid+=distance; else cutting+=distance;
      last=point;
    }
  }
  return {cuttingLength:cutting,rapidDistance:rapid,cycleSeconds:cutting/feed*60+rapid/rapidRate*60};
}

export function gcodeFor({length,width,depth,toolDiameter,stepOver,profile,feed,rpm}) {
  const {paths}=generateToolpath({length,width,depth,toolDiameter,stepOver,profile});
  const lines=['G21','G90','G17','G40','G94',`T1 M6`,`S${rpm} M3`, 'G0 Z5.0','G0 X0 Y0'];
  for(const path of paths){
    if(!path.length)continue;
    lines.push(`G0 X${path[0].x.toFixed(2)} Y${path[0].y.toFixed(2)} Z5.0`);
    lines.push(`G1 Z${path[0].z.toFixed(2)} F${feed}`);
    for(let i=1;i<path.length;i++)lines.push(`G1 X${path[i].x.toFixed(2)} Y${path[i].y.toFixed(2)} Z${path[i].z.toFixed(2)} F${feed}`);
    lines.push('G0 Z5.0');
  }
  lines.push('G0 X0 Y0','M5','M30');
  return lines.join('\n');
}
