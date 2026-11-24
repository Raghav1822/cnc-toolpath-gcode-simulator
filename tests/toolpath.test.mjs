import test from 'node:test';
import assert from 'node:assert/strict';
import {generateToolpath,toolpathMetrics,gcodeFor} from '../toolpath.js';

test('circle profile generates toolpaths',()=>{const r=generateToolpath({length:120,width:80,depth:8,toolDiameter:10,stepOver:70,profile:'circle'});assert.ok(r.paths.length>0);assert.equal(r.depthPasses,2)});
test('square profile closes each contour',()=>{const r=generateToolpath({length:120,width:80,depth:4,toolDiameter:10,stepOver:50,profile:'square'});assert.ok(r.paths.every(p=>p[0].x===p.at(-1).x&&p[0].y===p.at(-1).y))});
test('metrics include cutting and rapid distances',()=>{const g=generateToolpath({length:120,width:80,depth:8,toolDiameter:10,stepOver:70,profile:'slot'});const m=toolpathMetrics({...g,paths:g.paths,feed:600,length:120,width:80});assert.ok(m.cuttingLength>0);assert.ok(m.cycleSeconds>0)});
test('G-code contains setup and program end',()=>{const g=gcodeFor({length:120,width:80,depth:8,toolDiameter:10,stepOver:70,profile:'circle',feed:600,rpm:6000});assert.match(g,/G21/);assert.match(g,/G1 Z-4/);assert.match(g,/M30/)});
