addEventListener("DOMContentLoaded", () => {
    const books = document.querySelector("select.book");
    const chapters = document.querySelector("select.chapter");
    const verses = document.querySelectorAll(".verses p w");
    const goto = chapter => location.href = `?book=${books.value}&chapter=${chapter}`;

    verses.forEach(verse => {
        verse.onclick = async function () {
            const sn = this.getAttribute("lemma").split(":").pop();
            const response = await fetch(`sn/${sn}`);
            const json = await response.json();
            console.log(json);
        };
    });

    books.onchange = () => goto(1);

    chapters.onchange = function () {
        goto(this.value);
    };
});