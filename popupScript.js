
let arrayobj = [];
let inf = {
    username: undefined,
    blacklisted: undefined,
    notes: undefined,
    csv: [{
        fileName: "Directory",
        fileDir: "./CompList.CSV",
    }],
    loadedCSV: "Directory",
}

// Messaging 
chrome.runtime.onMessage.addListener(function (request, sender) {
    console.log("cmnd: ", request.greeting);
    console.log("msg: ", request.message);
})
chrome.runtime.lastError;

function send(greetingCmnd, source) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
        var CurrTab = tabs[0];
        chrome.tabs.sendMessage(CurrTab.id, { message: arrayobj, greeting: greetingCmnd, source: source })
        console.log("sent command: ", greetingCmnd)
        console.log("source: ", source)
    })
}

function sendmsg2(cmnd, msg) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
        var tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, { greeting: cmnd, message: msg });
    });
}

// OnLoad :
window.addEventListener("load", () => {
    let navbtns = document.getElementsByClassName("tablink");
    let colorMenu = "#3f1442"
    for (let i = 0; i < navbtns.length; i++) {
        navbtns[i].addEventListener('click', function () {
            openPage(navbtns[i].innerHTML, this, colorMenu)
            console.log(navbtns[i])
        })
    }

    const upload = document.getElementById('upload');

    upload.addEventListener('click', () => {
        send("RunLILoaded", null);
    });

    // External Parts
    var extWebInput = document.getElementById("extWebInput")
    var form = document.getElementById("form")
    // Converts users' input and send it to > contentScript_Ext.js
    form.addEventListener('submit', function () {
        var xpath = "//*[contains(text(),'"
        xpath += extWebInput.value
        xpath += "')]"
        sendmsg2("extFilter", xpath)
        setTimeout(sendmsg2("run_extSearch", null), 500)
    })
    document.getElementById("defaultOpen").click();

    //Search Linkedin
    var pullerInput = document.getElementById("pullerInput")
    var form2 = document.getElementById("form2")
    form2.addEventListener('submit', function () {
        var url = "https://www.linkedin.com/search/results/all/?keywords=" + pullerInput.value;
        chrome.tabs.create({ url: url });
    })

    //Popup Notes Menu
    const noteMenu = document.querySelectorAll(".noteMenu");
    const noteContent = document.querySelectorAll(".noteContent");
    const clickedMenu = document.querySelectorAll(".clickedMenu");

    for (let i = 0; i < noteMenu.length; i++) {
        noteMenu[i].addEventListener('click', function () {
            noteContent[i].style.display = "block";
            noteMenu[i].style.display = "none";
            clickedMenu[i].style.display = "block";
        })
        clickedMenu[i].addEventListener('click', function () {
            noteContent[i].style.display = "none";
            noteMenu[i].style.display = "block";
            clickedMenu[i].style.display = "none";
        })
    }

    // Copy Notes Function
    const cpyBtns = document.querySelectorAll(".cpyBtn");
    for (let i = 0; i < cpyBtns.length; i++) {
        cpyBtns[i].addEventListener('click', function () {
            var cpyNote = cpyBtns[i].parentElement.innerText;
            navigator.clipboard.writeText(cpyNote);
        })
    }

    // Login Function
    const noUser = document.getElementById("noUser")
    const LoggedUser = document.getElementById("LoggedUser")
    const inputUsr = document.getElementById("inputUsr")
    const formUsr = document.querySelector("#formUsr")

    let storedObj = localStorage.getItem("userinf");
    let convObj = JSON.parse(storedObj);
    function updtObj() {
        localStorage.setItem("userinf", JSON.stringify(convObj));
        storedObj = localStorage.getItem("userinf");
        convObj = JSON.parse(storedObj);
    }

    formUsr.addEventListener('submit', function () {
        if (inputUsr.value) {
            inf.username = inputUsr.value
            localStorage.setItem("userinf", JSON.stringify(inf))
        }
    });

    const displayUsr = document.getElementById("username");
    const logoutUsr = document.getElementById("logout");

    logoutUsr.addEventListener('click', function () {
        localStorage.clear();
    });

    if (convObj !== null) {
        noUser.style.display = "none";
        LoggedUser.style.display = "block";
        displayUsr.innerHTML = convObj.username
    }

    // Data selection 
    let selectDisplay = document.querySelector("#fileDisplay2")
    let selection = document.querySelector("#fileSlct")
    let options = document.createElement("option")
    let loadBtn3 = document.querySelector(".loadBtn3")

    if (convObj !== null) {
        selectDisplay.innerHTML = convObj.loadedCSV;
        for (let i = 0; i < convObj.csv.length; i++) {
            options.text = convObj.csv[i].fileName
            selection.appendChild(options.cloneNode(true));
        }
    } else {
        selectDisplay.innerHTML = "Directory"
        options.text = "Directory"
        selection.appendChild(options.cloneNode(true));
    }
   
    loadBtn3.addEventListener('click', function() {
        let i = selection.selectedIndex;
        convObj.loadedCSV = selection.options[i].text; 
        updtObj();
        location.reload();
    })

    // CSV Upload Function
    const fileInp = document.getElementById('fileInp');
    const fileUpld = document.getElementById('fileUpld');
    const fileDisplay = document.querySelector('#fileDisplay');
    const noCSV = document.querySelector("#noCSV")
    let inpFile;

    fileInp.addEventListener('change', function () {
        inpFile = fileInp.files[0];
        fileDisplay.innerHTML = inpFile.name;
        const reader = new FileReader();
        reader.readAsText(inpFile);
        let inpFile2;
        reader.addEventListener("load", function() {
            inpFile2 = reader.result;
        })

        if (inpFile.type === "text/csv" && convObj !== null) {
            noCSV.innerHTML = ""
            fileUpld.addEventListener("submit", function () {
                console.log("pushing")
                convObj.csv.push({
                    fileName: inpFile.name,
                    fileDir: inpFile2
                });
                updtObj();

                fileUpld.style.outline = "1.2px solid white"
                fileUpld.style.outlineOffset = "-1px"
                setTimeout(function () {
                    fileUpld.style.outline = "none"
                }, 500)
            })
        } else if(inpFile.type !== "text/csv") {
            noCSV.innerHTML = "Please only enter a CSV file"
        } else if(convObj === null) {
            noCSV.innerHTML = "Please login first"
        }
    })

    // Blacklist function 
    const blacklist = document.getElementById('blackList');
    const blistBtn = document.querySelector("#bListBtn");

    function sendblist() {
        if (convObj.blacklisted !== undefined) {
            sendmsg2("blacklists", convObj.blacklisted)
        }
    }

    blistBtn.addEventListener('submit', function () {
        let blistmsg = "," + blacklist.value
        if (storedObj !== "undefined") {
            if (convObj.blacklisted === undefined) {
                convObj.blacklisted = blistmsg;
            } else {
                var tmpList = convObj.blacklist
                tmpList = tmpList + blistmsg
                convObj.blacklisted = tmpList
            }
            updtObj();
            sendblist();
        } else {
            sendmsg2("blacklists", blistmsg);
        }
    });

    //Clear Blacklist
    const clrBlist = document.querySelector(".cBlistWrp")
    clrBlist.addEventListener('click', function () {
        convObj.blacklisted = undefined;
        updtObj();
        clrBlist.style.outline = "2px solid white"
        clrBlist.style.outlineOffset = "-1px"
        setTimeout(function () {
            clrBlist.style.outline = "none"
        }, 500)
    });

    // Parsing Function
    if (convObj !== null) {
        const currFile = convObj.loadedCSV;
        let savedFiles = convObj.csv;
        for (let i = 0; i < savedFiles.length;i++) {
            if (savedFiles[i].fileName === currFile) {
                if (i === 0) {
                    parse2(savedFiles[i].fileDir, savedFiles[i].fileName)
                }
                parse(savedFiles[i].fileDir, savedFiles[i].fileName)
            }
        }
    } else {
        parse2("./CompList.CSV", "Directory")
    }

    function parse(data, src) {
        Papa.parse(
            data,
            {
                quotes: false,
                header: false,
                skipEmptyLines: true,
                complete: function (results) {
                    arrayobj = results.data;
                    console.log(arrayobj);
                    send("arrayobjGet", src);
                    setTimeout(sendblist, 500);
                }
            }
        );
    }
    function parse2(data, src) {
        Papa.parse(
            data,
            {
                quotes: false,
                header: false,
                download: true,
                skipEmptyLines: true,
                complete: function (results) {
                    arrayobj = results.data;
                    console.log(arrayobj);
                    send("arrayobjGet", src);
                    setTimeout(sendblist, 500);
                }
            }
        );
    }
});

// Tab navigation function
function openPage(pageName, elmnt, color) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
    }
    document.getElementById(pageName).style.display = "block";
    elmnt.style.backgroundColor = color;
}





