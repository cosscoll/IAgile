import assert from 'node:assert/strict';
import {TROUBLESHOOTING,findTroubleshooting} from '../academy-app/depannage-data.mjs';
const slugs=['processus','automatisation','agents','sites-3d'];
assert.equal(TROUBLESHOOTING.length,20);
assert.equal(new Set(TROUBLESHOOTING.map(x=>x.id)).size,20);
for(const slug of slugs){
 const items=findTroubleshooting({course:slug});
 assert.equal(items.length,5,slug);
 assert(items.every(x=>x.course===slug));
}
for(const item of TROUBLESHOOTING){
 for(const field of ['title','symptom','check','fix','evidence']){
  assert(typeof item[field]==='string'&&item[field].length>25,item.id+' missing '+field);
 }
 assert.equal(item.status,'generic-guidance-not-device-tested');
}
assert.equal(findTroubleshooting().length,20);
assert(findTroubleshooting({query:'camera'}).some(x=>x.course==='sites-3d'),'Diacritics should be removable');
assert(findTroubleshooting({query:'429'}).some(x=>x.course==='automatisation'));
assert(findTroubleshooting({query:'source',course:'processus'}).every(x=>x.course==='processus'));
assert.equal(findTroubleshooting({query:'this phrase does not exist'}).length,0);
assert.equal(findTroubleshooting({course:'notreal'}).length,0);
console.log('PASS troubleshooting library: 20 complete cards, 5 per course, accent-insensitive filter and no premium data');
