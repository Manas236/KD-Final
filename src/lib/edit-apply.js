/* ============================================================
   Writing a saved edit onto its slot: the ONE copy of the rule
   ------------------------------------------------------------
   Run in two places, and the point of this file is that it is the same
   code in both:

     · the browser. BaseLayout.astro writes this function's own source
       into the page, ahead of the in-page editor's head script, which
       builds its applyOne() from it. That is the read path that has
       always painted saved edits for visitors.
     · the server, since 27 Oct 2026. src/lib/server-edits.ts runs it
       over the rendered page (parsed with parse5, which builds the same
       tree a browser builds) before the page is sent, so the HTML itself
       carries the saved text: link previews, a search engine's first
       read and a visitor without JavaScript see what the site now says.

   Because it is sent to the browser as its own source text, it must
   stand alone: no imports, nothing from the module around it, and
   nothing newer than the head script's own ES5 (var, function). It only
   touches what a parse5 adapter also offers: childNodes, firstChild
   (nodeType, nodeValue), dataset, setAttribute, textContent.

   The rules are the ones the head script has had since the port from
   Nesting Tree (see the note in BaseLayout.astro):

     · a key names the FIRST element in <body> with that data-edit value
       (`find`, which each side supplies);
     · it is written only onto a TEXT LEAF, one non-empty text node and
       nothing else. A key whose slot has gone (a retired card) or is no
       longer a leaf anchors nowhere and paints nothing, on either side;
     · writing it records the anchor (the text the edit replaced, kept if
       already recorded), the key and the text, and marks the element
       data-nt-edited, which the editor reads.
   ============================================================ */
export function ntApplyCore(find, normalize) {
  /* Editable means one text node and nothing else: a leaf holding
     a single run of words. Anything richer would lose its children
     the moment we assigned textContent. */
  function isTextLeaf(el) {
    return (
      el.childNodes.length === 1 &&
      el.firstChild.nodeType === 3 &&
      normalize(el.firstChild.nodeValue) !== ""
    );
  }

  function setText(el, t) {
    el.textContent = t;
  }

  function place(el, key, text, original) {
    /* The anchor is what the page said when the edit was made. It
       is recorded, not matched on. See the note in BaseLayout.astro. */
    if (!el.dataset.ntOriginal) el.dataset.ntOriginal = original;
    el.dataset.ntKey = key;
    el.dataset.ntApplied = text;
    el.setAttribute("data-nt-edited", "");
    setText(el, text);
    return el;
  }

  /* Find the slot; write to it. There is no second guess and no
     fallback scan: a named key either names an element on this
     page or it names one that has been retired, and writing a
     retired key's text onto some other element that happens to
     match a string is exactly the accident this design removes. */
  function applyOne(key, text, original) {
    if (!text) return null;
    var el = find(key);
    if (!el || !isTextLeaf(el)) return null;
    return place(el, key, text, original);
  }

  return { isTextLeaf: isTextLeaf, setText: setText, place: place, applyOne: applyOne };
}
