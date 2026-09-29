fetch("/sidebar.html")
  .then((r) => r.text())
  .then((html) => {
    document.getElementById("sidebar").innerHTML = html;
    lucide.createIcons();
    highlightActive();

    document.querySelector(".sidebar-close").addEventListener("click", () => {
      document.querySelector(".sidebar").classList.toggle("collapsed");
    });
  });

function highlightActive() {
  const path = location.pathname;
  document.querySelectorAll(".sidebar a").forEach((link) => {
    if (
      link.getAttribute("href") === path ||
      path.includes(link.getAttribute("href"))
    ) {
      link.classList.add("active");
    }
  });
}
