import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildReviewQueue,sameRevision} from '../academy-app/instructor-policy.mjs';

const stamp='2026-10-12T12:00:00.000Z';
const answer={user_id:'user_A',course_slug:'processus',deliverable_index:3,content:'<img src=x onerror=alert(1)>',updated_at:stamp};
const course=[{slug:'processus',title:'IA au quotidien',published:true}];
const prompts=[{course_slug:'processus',deliverable_index:3,title:'Défi',published:true}];
const stale={user_id:'user_A',course_slug:'processus',deliverable_index:3,
  status:'validated',feedback_text:'Retour sur une copie différente',answer_updated_at:'2026-10-11T11:00:00Z'};
const current={...stale,answer_updated_at:stamp};
assert.equal(buildReviewQueue(course,prompts,[answer],[stale]).length,1);
assert.equal(buildReviewQueue(course,prompts,[answer],[stale])[0].last_review,null,'Old correction must disappear');
assert.equal(buildReviewQueue(course,prompts,[answer],[current])[0].last_review.status,'validated');
assert.equal(buildReviewQueue([{...course[0],published:false}],prompts,[answer],[current]).length,0);
assert.equal(buildReviewQueue(course,[{...prompts[0],published:false}],[answer],[current]).length,0);
assert.equal(buildReviewQueue(course,prompts,[{...answer,course_slug:'sites-3d'}],[current]).length,0);
assert.equal(buildReviewQueue(course,prompts,[{...answer,deliverable_index:19}],[current]).length,0);
assert.equal(buildReviewQueue(course,prompts,[{...answer,updated_at:'invalid'}],[current]).length,0);
assert.equal(sameRevision(stamp,'2026-10-12T12:00:00Z'),true);
assert.equal(sameRevision('garbage',stamp),false);
assert.equal(sameRevision(undefined,undefined),false);
assert.equal(buildReviewQueue(course,prompts,[answer],[])[0].content,answer.content,
  'The presentation helper must preserve text as inert content, not execute HTML');
const js=fs.readFileSync('academy-app/instructor.js','utf8');
const html=fs.readFileSync('academy-app/instructor.html','utf8');
assert(js.includes("textContent=answer.content"),'Learner submissions must remain inert text');
assert(!js.includes('.innerHTML'),'Instructor UI must never inject HTML from data');
assert(js.includes("shouldCreateUser:false"),'Instructor login must not self-register arbitrary accounts');
assert(js.includes("buildReviewQueue(courses,prompts,answers,corrections)"));
assert(js.includes("answer_updated_at:answer.updated_at"),'Grades must be tied to observed answer version');
assert(js.includes('sameRevision(result.data?.answer_updated_at,answer.updated_at)'),
  'Server response version must be verified after write');
assert(js.includes('if(request!==generation)return'),'Stale requests must not repaint learner data');
assert(html.includes('noindex,nofollow'),'Instructor page must not be indexed');
assert(html.includes('type="module" src="instructor.js"'),'Instructor JS must be loaded as module');
console.log('PASS instructor review queue hides private/unpublished/stale content and uses revision-aware save');
