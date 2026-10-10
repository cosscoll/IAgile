import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequestGuard } from '../request-guard.js';

test('out-of-order responses cannot overwrite a newer view', () => {
 const gate=createRequestGuard();
 const first=gate.next(), second=gate.next();
 assert.equal(gate.valid(first),false);
 assert.equal(gate.valid(second),true);
});
test('logout invalidates requests from the previous session', () => {
 const gate=createRequestGuard();
 const token=gate.next();gate.invalidate();
 assert.equal(gate.valid(token),false);
 assert.equal(gate.valid(gate.current()),true);
});
