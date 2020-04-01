navbar = document.getElementById("navbar");
subnav = document.getElementById("subnav");
var current_campaign = "";

function open_subnav(campaign) {
    current_campaign = campaign;
    document.getElementById("subnav_title").innerHTML = campaign;

    // Get description of campaign from server through a long and convoluted process kill me
    // At least fetch() is pretty intuitive
                                            // Resolves promise returned by fetch(), which returns a strange object
                                            // I have no idea what the strange object is but it seems to be just a blob of data
                                                                // Get the text from said strange object, which returns another promise for some reason
                                                                                // Resolve second promise, finally getting what we want
                                                                                            // Update the mini-description of the campaign inside the subnav
    fetch("./campaign_info/"+campaign+"/desc").then(result => { result.text().then(data => { document.getElementById("subnav_desc").innerHTML = data; }) });

    navbar.className = "navbar active";
    subnav.className = "navbar";
}

function open_page(page_name) {
    document.location.href = "/campaigns/" + current_campaign + "/" + page_name;
}

function open_world() {
    document.location.href = "/campaigns/" + current_campaign;
}

function close_subnav() {
    navbar.className = "navbar";
    subnav.className = "navbar active";
}