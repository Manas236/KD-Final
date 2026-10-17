/* ============================================================
   Edit mode on a page with photographs: a link to the studio gallery
   manager. Loaded only for a signed-in editor (the kd_edit_ui hint
   cookie, as careers-editor.js is); shown only while "Edit text" is on
   (public/editor-ui.css). Marked data-nt-ui so the text editor leaves
   it alone.

   On a page about one project (its <main data-gallery-project>), the
   link opens the manager at that project's box, photographs or not, so
   a project with none yet is one click from its first upload.
   ============================================================ */
import { anchorOf } from "./gallery-anchor.js";

const project = document.querySelector("[data-gallery-project]")?.getAttribute("data-gallery-project");
const link = document.createElement("a");
link.href = "/studio/gallery" + (project ? `#${anchorOf(project)}` : "");
link.className = "nt-gallery-manage";
link.setAttribute("data-nt-ui", "");
link.textContent = "Manage photos";
document.body.appendChild(link);
