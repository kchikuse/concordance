addEventListener("DOMContentLoaded", () => {
    const analysis = document.querySelector(".analysis");

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
        const books = document.querySelector(".books");
        const book = new URLSearchParams(location.search).get("book");
        books.scrollTop = document.querySelector(`[book="${book}"]`).offsetTop;
    })();

    (async function() {
        const response = await fetch(`sn/H04941`);
        analysis.innerHTML = await response.text();
    })();
});