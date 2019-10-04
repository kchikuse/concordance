addEventListener("DOMContentLoaded", () => {
    const $ = e => document.querySelector(e);
    const analysis = $(".analysis");

    document.onclick = async event => {
        const e = event.target;

        if (e.tagName.toLowerCase() == "w") {
            const hasLemma = e.hasAttribute("lemma");
            const sn = hasLemma ? e.getAttribute("lemma").split(":").pop() :
                e.getAttribute("src");

            if (!sn) return;

            const response = await fetch(`sn/${sn}`);
            analysis.innerHTML = await response.text();
        }
    };

    (() => {
        const book = new URLSearchParams(location.search).get("book");
        $(".books").scrollTop = $(`[book="${book}"]`).offsetTop;
    })();
});