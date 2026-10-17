/* ============================================================
   A project's box in the studio gallery manager: its element id
   ------------------------------------------------------------
   One function for both ends of the link: gallery-manager.js gives
   each project's box this id, and a project page's edit-mode "Manage
   photos" link (gallery-manage-link.js) ends in it, so the editor lands
   on that project.
   ============================================================ */
export function anchorOf(project) {
  return "g-" + project.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
