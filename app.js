addEventListener("DOMContentLoaded", () => {
    const $ = e => document.querySelector(e);
    const get = key => localStorage.getItem(key);
    const set = (key, value) => localStorage.setItem(key, value);
    const analysis = $(".analysis");
    const details = $("details");
    const search = $("#search");
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

    search.onkeypress = async e => {
        if(e.keyCode == 13) {
            const query = e.target.value;
            if(query.trim().length == 0) return;
            const response = await fetch(`search/${query}`);
            const results = await response.text();
            console.log(results);
        }
    };

    details.ontoggle = e => set("open", e.target.open);
    details.open = get("open") === String(true);

    books.onclick = () => set("pos", books.scrollTop);
    books.scrollTop = get("pos");
});