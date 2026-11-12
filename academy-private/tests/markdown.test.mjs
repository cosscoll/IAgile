import test from 'node:test';
import assert from 'node:assert/strict';
import { renderCourseMarkdown } from '../markdown.js';

class Element {
  constructor(tagName){this.tagName=tagName.toUpperCase();this.children=[];this._text='';}
  append(...items){this.children.push(...items);}
  set textContent(value){this._text=String(value);this.children=[];}
  get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
}
globalThis.document={
  createElement(tag){return new Element(tag);},
  createTextNode(value){const n=new Element('#text');n.textContent=value;return n;}
};
test('course headings, lists and emphasis remain readable',()=>{
  const result=renderCourseMarkdown('# Module 1\n\n## Exercice\n- Une **consigne**\n- Autre étape\n');
  assert.equal(result.children[0].tagName,'H4');
  assert.equal(result.children[1].tagName,'H5');
  assert.equal(result.children[2].tagName,'UL');
  assert.equal(result.children[2].children[0].textContent,'Une consigne');
  assert.equal(result.children[2].children[0].children[1].tagName,'STRONG');
});
test('markup and inline scripts are always treated as plain text',()=>{
  const example='<img src=x onerror=alert(1)> **texte**';
  const result=renderCourseMarkdown(example);
  assert.equal(result.children[0].tagName,'P');
  assert.equal(result.children[0].textContent,'<img src=x onerror=alert(1)> texte');
  assert(!result.children.some(x=>x.tagName==='IMG'||x.tagName==='SCRIPT'));
});
test('fenced code is not executed or parsed as HTML',()=>{
  const result=renderCourseMarkdown('```js\n<script>alert(1)</script>\n```');
  assert.equal(result.children[0].tagName,'PRE');
  assert(result.children[0].textContent.includes('<script>'));
});
