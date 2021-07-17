
var button = document.getElementById("disable");
button.disabled = true;
var enabled = false;
var uMich = document.getElementById("uMich");
var stonyB = document.getElementById("stony");
var stonyID = 971;
var uMichID = 1258;

// if (window.location.protocol !== "https:") {
//     window.location.protocol = "https:";
// }

// uMich Button
uMich.addEventListener("click", () => {
    if (!enabled) {
        chrome.storage.sync.set({"umichOpacity": "1"}, () => {
            uMich.style.opacity = "1";
            button.disabled = false;
        });
        enabled = true;
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, "UMich");
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                function: uMichigan
            });
        });
    }
});

// Stony Button
stony.addEventListener("click", () => {
    if (!enabled) {
        chrome.storage.sync.set({"stonyOpacity": "1"}, () => {
            stony.style.opacity = "1";
            button.disabled = false;
        });
        enabled = true;
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, "stony");
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                function: stonyBrook
            });
        });
    }
});

// Disable Button
document.getElementById("disable").addEventListener("click", function() {
    if (enabled) {
        chrome.storage.sync.set({"umichOpacity": "0.5"}, () => {
            uMich.style.opacity = "0.5";
            button.disabled = true;
        });
        chrome.storage.sync.set({"stonyOpacity": "0.5"}, () => {
            stony.style.opacity = "0.5";
            button.disabled = true;
        });
        enabled = false;
    }
});

document.body.onload = () => {
    chrome.storage.sync.get("umichOpacity", (result) => {
        let umichOpacity = result["umichOpacity"];
        if (umichOpacity === "1") {
            uMich.style.opacity = umichOpacity;
            button.disabled = false;
            enabled = true;
        }
    });
    chrome.storage.sync.get("stonyOpacity", (result) => {
        let stonyOpacity = result["stonyOpacity"];
        if (stonyOpacity === "1") {
            stony.style.opacity = stonyOpacity;
            button.disabled = false;
            enabled = true;
        }
    });
}

// schoolID : int
// profs: Set<String>
async function infoScraper(schoolID, profs) {
    let numOfProfs = 20 + (await ((await fetch("https://www.ratemyprofessors.com/filter/professor/?&page=1&filter=teacherlastname_sort_s+asc&query=*%3A*&queryoption=TEACHER&queryBy=schoolId&sid=" + schoolID)).json())).remaining;
    let numOfPages = Math.ceil(numOfProfs / 20);
    let i = 1;
    info = {};
    let numProfsAdded = 0;
    while (i <= numOfPages) {
        let pageProfs = (await ((await fetch("https://www.ratemyprofessors.com/filter/professor/?&page=" + i + "&filter=teacherlastname_sort_s+asc&query=*%3A*&queryoption=TEACHER&queryBy=schoolId&sid=" + schoolID)).json())).professors;
        let firstProf = pageProfs[0];
        let lastProf = pageProfs[pageProfs.length - 1];
        for (let prof of profs) {
            let profName = parseName(prof);
            if (firstProf["tLname"].toLowerCase().localeCompare(profName[1]) <= 0 && profName[1].localeCompare(lastProf["tLname"].toLowerCase()) <= 0) {
                console.log("Found a match: " + profName[0] + profName[1] + " is suspected to be on page" + i);
                for (let pageProf of pageProfs) {
                    if (profName[0] === pageProf["tFname"].toLowerCase() && profName[1] === pageProf["tLname"].toLowerCase()) {
                        console.log("found " + profName[0] + " " + profName[1] + "'s ratings. adding them to info")
                        info[prof] = {
                            rating: pageProf["overall_rating"],
                            numRatings: pageProf["tNumRatings"],
                            dept: pageProf["tDept"],
                            tid: pageProf["tid"]
                        }
                        numProfsAdded += 1;
                        console.log(info);
                    }
                }
                break;
            }
        }
        if (numProfsAdded >= profs.size) {
            break;
        }
        i += 1;
    }
    return info;
}

// Returns object of filtered name
// Format -> {first: firstName, last: lastName}
function parseName(name) {
    name = name.toLowerCase();
    for (let seq of [/\r?\n|\r/g, /(\r\n|\n|\r)/gm, "<br>", "staff", "; homepage"]) {
        name = name.replaceAll(seq, "");
    }
    
    let names = name.trim().split(" ");
    if (names.length >= 2) {
        return [names[0].toLowerCase(), names[1].toLowerCase()];
    } else {
        return ["",""];
    }
}

async function uMichigan() {
    let profs = new Set();
    $('div.col-sm-3 a').addClass("Instructor");
    var instructors = document.getElementsByClassName("Instructor");
    for (let i = 0; i < instructors.length; i++) {
        var name = instructors[i].innerHTML;
        for (let seq of ["  she-her-hers", "  she-her", "  she-hers", " he-him-his", " He-Him-His", " 'he-him-his'"]) {
            name = name.replaceAll(seq, "");
        }
        if (name.includes(", ")) {
            name = name.replace(", ", ",");
        }
        name = name.replace(" ", ",");
        name += " ";
        name = name.replace(" ","");
        var nameArray = name.split(",");
        var fullName = nameArray[1] + " " + nameArray[0];
        instructors[i].innerHTML = fullName;
        profs.add(fullName);
    }
    let info = await infoScraper(uMichID, profs);
    for (let instructor of instructors) {
        const rating = document.createElement("p");
        if (info[instructor.innerHTML]) {
            var instructorRating = info[instructor.innerHTML].rating;
            var numRating = info[instructor.innerHTML].numRatings;
            var emoji = "";
            if (0 <= instructorRating && instructorRating < 3) {
                emoji = "😶";
            } else if (3 <= instructorRating && instructorRating < 4) {
                emoji = "😐";
            } else if (4 <= instructorRating && instructorRating <= 5) {
                emoji = "😄";
            }
            var ratingText = emoji + " Overall Rating: " + instructorRating + " / 5 Based on " + numRating + " ratings. ";
            rating.appendChild(document.createTextNode(ratingText));
            instructor.setAttribute("href", "https://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + info[instructor.innerHTML].tid);
        }
        else {
            rating.appendChild(document.createTextNode("🤔 Professor Not Found"));
        }
        instructor.appendChild(rating);
    }
}


setInterval(() => {
    if (enabled && stony.style.opacity === "1" && window.location.href.startsWith("https://psns.cc.stonybrook.edu/")) {
        stonyBrook();
    }
}, 100);
async function stonyBrook() {
    console.log("shalom1");
    if (!window.location.href.startsWith("https://psns.cc.stonybrook.edu/")) {
        return;
    }
    console.log("shalom2");
    let nodes = document.querySelectorAll("[id^=MTG_INSTR]");
    let profSet = new Set();
    nodes.forEach((node) => {
        if (node.innerHTML.toLowerCase() !== "staff") {
            let nameArr = parseName(node.innerHTML);
            node.innerHTML = nameArr[0][0].toUpperCase() + nameArr[0].substring(1) + " " + nameArr[1][0].toUpperCase() + nameArr[1].substring(1);
            profSet.add(node.innerText);
        }
    });

    console.log(profSet);

    let info = await infoScraper(stonyID, profSet);

    // HTML processing
    for (let node of nodes) {
        try {
            if (node.innerHTML.toLowerCase() !== "staff") {
                console.log("processing " + node.innerHTML + "'s ratings");
                // Create link with name
                let link = document.createElement("a");
                link.href = "https://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + info[node.innerHTML].tid;
                link.setAttribute("target", "_blank");
                link.innerHTML = node.innerHTML;
                link.style.color = "black";
                link.style.textDecoration = "none";
    
                // Set link
                node.innerHTML = "";
                node.appendChild(link);
                node.innerHTML += "<br/>";
    
                // Add rating
                let rating = info[link.innerHTML].rating;
                let ratingNode = document.createElement("span");
                ratingNode.innerHTML += "Rating: " + rating + " / 5"
                if (0 <= rating && rating < 2) {
                    ratingNode.style.color = "red";
                    ratingNode.innerHTML += " 🗑️";
                } else if (2 <= rating && rating < 3) {
                    ratingNode.style.color = "orange";
                    ratingNode.innerHTML += " 😐";
                } else if (3 <= rating && rating <= 4) {
                    ratingNode.style.color = "green";
                    ratingNode.innerHTML += " 🙂";
                } else if (4 <= rating && rating <= 5) {
                    ratingNode.style.color = "blue";
                    ratingNode.innerHTML += " 😃";
                }
                ratingNode.innerHTML += "<br/>";
                node.appendChild(ratingNode);
    
    
                // Add num ratings
                let numRatingsNode = document.createElement("span");
                numRatingsNode.innerHTML = "From " + info[link.innerHTML].numRatings + " ratings";
                node.appendChild(numRatingsNode);
            }
        } catch (ignored) {

        }
    }
}