addEventListener("DOMContentLoaded", () => {
    const tooltip = document.querySelector("#tooltip");
    const books = document.querySelector("select.book");
    const chapters = document.querySelector("select.chapter");
    const verses = document.querySelectorAll(".verses p w");
    const goto = chapter => location.href = `?book=${books.value}&chapter=${chapter}`;

    verses.forEach(verse => {
        verse.onclick = async function (e) {
            const sn = this.getAttribute("lemma").split(":").pop();
            const response = await fetch(`sn/${sn}`);
            const json = await response.json();
            console.log(json);

            const left = e.clientX - tooltip.offsetWidth / 2;
            const top = e.clientY - tooltip.offsetHeight / 2;
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
            tooltip.innerHTML = json[0].meaning;
            tooltip.style.display = "block";
        };
    });

    books.onchange = () => goto(1);

    chapters.onchange = function () {
        goto(this.value);
    };
});