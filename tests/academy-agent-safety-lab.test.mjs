import assert from 'node:assert/strict';
import {scenarios,decideToolCall,evaluateScenario} from '../scripts/academy-agent-safety-lab.mjs';
assert.equal(scenarios.length,20);
assert.equal(new Set(scenarios.map(x=>x.id)).size,20);
for(const row of scenarios){const result=evaluateScenario(row);assert.equal(result.pass,true,JSON.stringify(result));}
assert.equal(decideToolCall({role:'editor',action:'write',resource:'public',approved:true}),'allow');
assert.equal(decideToolCall({role:'editor',action:'write',resource:'public',approved:'true'}),'needs-approval');
assert.equal(decideToolCall({role:'reader',action:'write',resource:'public',approved:true}),'deny');
assert.equal(decideToolCall({role:'admin',action:'write',resource:'private',approved:true}),'deny');
assert.equal(decideToolCall({role:'admin',action:'read',resource:'private'}),'allow');
assert.equal(decideToolCall({role:'reader',action:'read',resource:'public',turns:10,maxTurns:10}),'stop');
assert.equal(decideToolCall({role:'reader',action:'read',resource:'public',spent:100,budget:100}),'stop');
assert.equal(decideToolCall({role:'reader',action:'read',resource:'public',sourceTrusted:false}),'deny');
console.log('PASS simulated agent: 20 reproducible policy scenarios, injection refusal, costs, bounded turns');
