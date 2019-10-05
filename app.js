addEventListener("DOMContentLoaded", () => {
    const $ = e => document.querySelector(e);
    const analysis = $(".analysis");
    const details = $("details");

    document.onclick = async event => {
        let e = event.target;
        const tag = e.tagName.toLowerCase();

        if(["w", "divinename"].indexOf(tag) < 0) {
            return;
        }

        if (tag == "divinename") {
            e = e.closest("w");
        }

        const sn = e.hasAttribute("lemma") ?
            e.getAttribute("lemma").split(":").pop() :
            e.getAttribute("src");

        if (!sn) return;

        const response = await fetch(`sn/${sn}`);
        analysis.innerHTML = await response.text();
        details.removeAttribute("open");
    };

    (() => {
        const book = new URLSearchParams(location.search).get("book");
        $(".books").scrollTop = $(`[book="${book}"]`).offsetTop;
    })();
});