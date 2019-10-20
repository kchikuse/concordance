addEventListener("DOMContentLoaded", () => {
    const blank = e => !e || e.trim().length == 0;
    const details = document.querySelectorAll("details");
    const analysis = document.querySelector(".analysis");
    const search = document.querySelector("#search");

    document.onclick = e => {
        let item = e.target;
        const tags = ["w", "divinename"];
        const tag = item.tagName.toLowerCase();

        if (tags.indexOf(tag) == -1) {
            return;
        }

        if (tag == tags[1]) {
            item = item.closest("w");
        }

        const sn = item.getAttribute("lemma");
        if (blank(sn)) return;
        load(`sn/${sn}`);
    };

    search.onsearch = () => {
        const q = search.value;
        if (blank(q)) return;
        load("search/" + q);
    };

    const load = async url => {
        analysis.innerHTML = "LOADING...";
        const response = await fetch(url);
        analysis.innerHTML = await response.text();
        details.forEach(e => e.removeAttribute("open"));
    };

    (() => {
        load("sn/H04428");
    })();
});