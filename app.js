addEventListener("DOMContentLoaded", () => {
    const blank = e => !e || e.trim().length == 0;
    const details = document.querySelectorAll("details");
    const analysis = document.querySelector(".analysis");
    const search = document.querySelector("#search");

    document.onclick = event => {
        let e = event.target;
        const items = ["w", "divinename"];
        const tag = e.tagName.toLowerCase();

        if (items.indexOf(tag) == -1) {
            return;
        }

        if (tag == items[1]) {
            e = e.closest("w");
        }

        const sn = e.getAttribute("lemma");
        if (blank(sn)) return;
        load(`sn/${sn}`);
    };

    search.onsearch = () => {
        const q = search.value;
        if (blank(q)) return;
        load("search/" + q);
    };

    const load = async url => {
        analysis.innerHTML = "<loading/>";
        const response = await fetch(url);
        const html = await response.text();
        analysis.innerHTML = html;
        details.forEach(e => e.removeAttribute("open"));
        localStorage.setItem("q", html);
    };

    (() => {
        analysis.innerHTML = localStorage.getItem("q") || "";
    })();
});