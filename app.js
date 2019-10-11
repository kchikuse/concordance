addEventListener("DOMContentLoaded", () => {
    const $ = e => document.querySelector(e);
    const get = key => localStorage.getItem(key);
    const set = (key, value) => localStorage.setItem(key, value);
    const analysis = $(".analysis");
    const details = $("details");
    const books = $(".books");

    document.onclick = async event => {
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
        
        if (sn) {
            details.removeAttribute("open");
            analysis.innerHTML = "LOADING...";
            const response = await fetch(`sn/${sn}`);
            analysis.innerHTML = await response.text();
        }
    };

    details.ontoggle = e => set("open", e.target.open);
    details.open = get("open") === String(true);
    
    books.onclick = () => set("pos", books.scrollTop);
    books.scrollTop = get("pos");
});