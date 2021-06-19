
var button = document.getElementById("disable");
button.disabled = true;
var enabled = false;
var uMich = document.getElementById("uMich");
var stony = document.getElementById("stony");

// chrome.storage.sync.get("umichOpacity", (result) => {
//     console.log(result["umichOpacity"]);
// });
// chrome.storage.sync.get("stonyOpacity", (result) => {
//     console.log(result["stonyOpacity"]);
// });

// uMich Button
uMich.addEventListener("click", () => {
    if (!enabled) {
        chrome.storage.sync.set({"umichOpacity": "1"}, () => {
            uMich.style.opacity = "1";
            button.disabled = false;
        });
        enabled = true;
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