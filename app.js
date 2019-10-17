addEventListener("DOMContentLoaded", () => {
    const isblank = e => !e || e.trim().length == 0;
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
        if (isblank(sn)) return;
        load(`sn/${sn}`);
    };

    search.onsearch = () => {
        const q = search.value;

        if (isblank(q)) {
            clear();
            return;
        }

        load("search/" + q);
        localStorage.setItem("q", q);
    };

    search.onkeyup = e => {
        if(isblank(e.target.value)) clear();
    };

    const clear = () => {
        localStorage.removeItem("q");
        analysis.innerHTML = "";
    };

    const load = async url => {
        analysis.innerHTML = "<loading/>";
        const response = await fetch(url);
        analysis.innerHTML = await response.text();
        details.forEach(e => e.removeAttribute("open"));
    };

    (() => {
        const q = localStorage.getItem("q");
        if (!q) return;
        search.value = q;
        search.onsearch();
    })();
});