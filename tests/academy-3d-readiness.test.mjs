import assert from 'node:assert/strict';
import {CHECKS,assess3DReadiness} from '../scripts/academy-3d-readiness.mjs';
assert.equal(CHECKS.length,13);
assert.equal(new Set(CHECKS.map(x=>x.id)).size,13);
const empty=assess3DReadiness();
assert.equal(empty.status,'not-fully-tested');
assert.equal(empty.declaredPassed,0);
assert.equal(empty.missing.length,13);
const self=CHECKS.map(x=>({id:x.id,status:'passed',
 evidence:'Fictitious test statement for policy regression only.',device:'synthetic-device',browser:'synthetic-browser'}));
const reported=assess3DReadiness(self);
assert.equal(reported.status,'self-reported-ready-for-independent-review');
assert.equal(reported.declaredPassed,13);
assert.match(reported.warning,/not independently verified/);
const broken=assess3DReadiness([...self.slice(0,12),{...self[12],status:'failed'}]);
assert.equal(broken.status,'self-reported-failures');
assert.deepEqual(broken.failed,['public-version']);
const blocked=assess3DReadiness(self.slice(0,11));
assert.equal(blocked.status,'not-fully-tested');
assert.deepEqual(blocked.missing,['performance','public-version']);
const errors=[
 [{...self[0],evidence:'tiny'}],
 [{...self[0],device:'x'}],
 [{...self[0],browser:''}],
 [{...self[0],extra:'sensitive'}],
 [self[0],self[0]],
 [{...self[0],id:'invented'}],
 [{...self[0],status:'verified'}],
 null
];
for(const entries of errors)assert.throws(()=>assess3DReadiness(entries),/array|Unexpected|Unknown|require/);
assert.equal(assess3DReadiness([{id:'performance',status:'not-tested'}]).status,'not-fully-tested');
console.log('PASS 3D readiness: 13 independent checks, fail-closed missing devices, no false production verification');
