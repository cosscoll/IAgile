// Minimal safe Markdown renderer for trusted course records.
// All user- or course-supplied strings are inserted through textContent.
export function renderCourseMarkdown(markdown) {
  const root = document.createElement('div');
  root.className = 'course-markdown';
  const lines = String(markdown ?? '').replace(/\r\n?/g, '\n').split('\n');
  let list = null;
  let code = null;
  const closeList = () => { list = null; };
  const inline = (parent, source) => {
    const tokens = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\*[^*\n]+\*)/g;
    let last = 0;
    for (const match of source.matchAll(tokens)) {
      if (match.index > last) parent.append(document.createTextNode(source.slice(last, match.index)));
      const value = match[0];
      const tag = value.startsWith('**') ? 'strong' : value.startsWith('`') ? 'code' : 'em';
      const trim = tag === 'strong' ? 2 : 1;
      const element = document.createElement(tag);
      element.textContent = value.slice(trim, -trim);
      parent.append(element);
      last = match.index + value.length;
    }
    if (last < source.length) parent.append(document.createTextNode(source.slice(last)));
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\s*```/.test(line)) {
      closeList();
      if (code) { code = null; } else {
        const pre = document.createElement('pre');
        code = document.createElement('code');
        pre.append(code); root.append(pre);
      }
      continue;
    }
    if (code) { code.textContent += (code.textContent ? '\n' : '') + raw; continue; }
    if (!line.trim()) { closeList(); continue; }
    const heading = line.match(/^\s*(#{1,4})\s+(.+)/);
    if (heading) {
      closeList();
      const h = document.createElement('h' + Math.min(6, heading[1].length + 3));
      inline(h, heading[2]); root.append(h);
      continue;
    }
    const bullet = line.match(/^\s*([-*]|\d+\.)\s+(.+)/);
    if (bullet) {
      const kind = /^\d/.test(bullet[1]) ? 'ol' : 'ul';
      if (!list || list.tagName.toLowerCase() !== kind) {
        list = document.createElement(kind); root.append(list);
      }
      const li = document.createElement('li');
      inline(li, bullet[2]); list.append(li);
      continue;
    }
    closeList();
    const p = document.createElement('p');
    inline(p, line);
    root.append(p);
  }
  return root;
}
