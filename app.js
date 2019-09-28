addEventListener("DOMContentLoaded", () => {
    const $ = e => document.querySelector(e);
    const ANALYSIS = $("analysis");
    const BOOKS = $("select.book");
    const CHAPTERS = $("select.chapter");
    const goto = chapter => location.href = `?book=${BOOKS.value}&chapter=${chapter}`;

    BOOKS.onchange = () => goto(1);

    CHAPTERS.onchange = function () {
        goto(this.value);
    };

    document.onclick = async event => {
        const e = event.target;

        if (e.tagName.toLowerCase() == "w") {
            const hasLemma = e.hasAttribute("lemma");
            const sn = hasLemma ? e.getAttribute("lemma").split(":").pop() :
                e.getAttribute("src");

            if (!sn) return;

            const response = await fetch(`sn/${sn}`);
            ANALYSIS.innerHTML = await response.text();
        }
    };
});