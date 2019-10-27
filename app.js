addEventListener("DOMContentLoaded", () => {
    const words = document.querySelectorAll(".verses w");
    const details = document.querySelectorAll("details");
    const analysis = document.querySelector(".analysis");
    const search = document.querySelector("#search");

    document.onclick = async e => {
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
        if (sn) {
            output("LOADING...");
            const response = await fetch(`sn/${sn}`);
            output(await response.text());
        }
    };

    search.onsearch = async () => {
        const q = search.value;

        if (!q || q.trim().length == 0) {
            return output("");
        }

        output("LOADING...");

        const response = await fetch(`search/${q}`);
        
        if(response.status == 301) {
            const r = await response.json();
            location.href = `${r.book}/${r.chapter}`;
            return;
        }

        output(await response.text());
    };

    words.forEach(e => {
        e.onclick = () => {
            const ds = document.body.dataset;
            const sn = e.getAttribute("lemma");
            const url = `${ds.book}/${ds.chapter}/${sn}`;
            history.pushState({ sn }, sn, document.baseURI + url);
            style(`
                w[lemma="${sn}"],
                w[lemma="strong:${sn}"] {
                    border-bottom: var(--text-hilite);
                }
            `);
        };
    });

    const output = text => {
        details.forEach(e => e.removeAttribute("open"));
        analysis.innerHTML = text;
    };

    const style = css => {
        let ws = document.getElementById("ws");

        if( ! ws) {
            ws = document.createElement("style");
            ws.setAttribute("id", "ws");
            document.body.appendChild(ws);
        }

        ws.innerHTML = css;
    };
});