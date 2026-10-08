/* ============================================================
   Text blocks on project pages — the edit-mode half
   ------------------------------------------------------------
   Loaded only for a signed-in editor (the same hint cookie BaseLayout
   gates inline-edit.js on); /api/project-blocks checks the real session.
   Modelled on careers-editor.js.

   Adds, all marked data-nt-ui so the text editor leaves them alone, and
   all hidden by public/editor-ui.css until "Edit text" is on:

     · an "Add text" card at the end of the overview column: heading or
       paragraph, and the words
     · on every added block: move up, move down, remove

   Each reloads the page on success, because the blocks are rendered by
   the server. Changing a block's WORDING needs none of this: it is
   ordinary editable text.
   ============================================================ */
const host = document.querySelector("[data-text-blocks]");
if (host) {
  const slug = host.getAttribute("data-text-blocks");
  const blocks = [...host.querySelectorAll(":scope > [data-block]")];
  blocks.forEach((block, i) => addControls(block, i, blocks.length, slug));
  host.appendChild(addCard(slug));
}

function addControls(block, index, count, slug) {
  const bar = document.createElement("div");
  bar.className = "nt-blocks-tools";
  bar.setAttribute("data-nt-ui", "");
  const id = Number(block.dataset.block);

  const button = (label, title, onClick, disabled) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.title = title;
    b.disabled = !!disabled;
    b.addEventListener("click", async () => {
      b.disabled = true;
      const res = await onClick();
      if (res === false) {
        b.disabled = false;
        return;
      }
      if (res.ok) location.reload();
      else {
        b.disabled = false;
        window.alert(res.error);
      }
    });
    bar.appendChild(b);
  };

  button("↑", "Move up", () => send({ action: "move", slug, id, position: index - 1 }), index === 0);
  button("↓", "Move down", () => send({ action: "move", slug, id, position: index + 1 }), index === count - 1);
  button("Remove", "Remove this text from the page", () => {
    const text = block.textContent.trim();
    const short = text.length > 60 ? text.slice(0, 57) + "…" : text;
    if (!window.confirm(`Remove "${short}" from this page?`)) return false;
    return send({ action: "remove", slug, id });
  });

  block.appendChild(bar);
}

function addCard(slug) {
  const box = document.createElement("div");
  // Styled as the careers "Add a job posting" card, plus a textarea.
  box.className = "nt-jobs-add nt-blocks-add";
  box.setAttribute("data-nt-ui", "");
  box.innerHTML = `
    <form novalidate>
      <p class="nt-jobs-head">Add text to this page</p>
      <div class="nt-blocks-kind" role="radiogroup" aria-label="Kind of text">
        <label><input type="radio" name="kind" value="heading" /> Heading</label>
        <label><input type="radio" name="kind" value="paragraph" checked /> Paragraph</label>
      </div>
      <label>Text
        <textarea name="text" rows="4" maxlength="2000" placeholder="Type the heading or paragraph…"></textarea>
      </label>
      <p class="nt-jobs-note">It goes at the end of this section; use ↑ ↓ to move it. Click it afterwards to change the wording.</p>
      <p class="nt-jobs-error" role="alert" hidden></p>
      <button type="submit" class="nt-jobs-submit">Add to page</button>
    </form>`;

  const form = box.querySelector("form");
  const error = box.querySelector(".nt-jobs-error");
  const submit = box.querySelector("button[type=submit]");
  const textarea = box.querySelector("textarea");

  form.addEventListener("change", () => {
    textarea.rows = form.elements.kind.value === "heading" ? 1 : 4;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.hidden = true;
    submit.disabled = true;
    const data = Object.fromEntries(new FormData(form));
    const res = await send({ action: "add", slug, kind: data.kind, text: data.text });
    if (res.ok) {
      location.reload();
      return;
    }
    submit.disabled = false;
    error.textContent = res.error;
    error.hidden = false;
  });
  return box;
}

async function send(body) {
  try {
    const res = await fetch("/api/project-blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "same-origin",
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401)
      return { ok: false, error: "Your editing session has ended — sign in again, then retry." };
    if (!res.ok) return { ok: false, error: data.error || "Could not save." };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "No connection — nothing was saved." };
  }
}
