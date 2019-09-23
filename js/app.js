$(() => {
    
    M.Sidenav.init($(".sidenav"), {});

    $(".verses p w").on("click", async function() {
        const sn = $(this).attr("lemma").split(":").pop();
        const response = await $.get(`sn/${sn}`);
        console.log(response);
    });
});