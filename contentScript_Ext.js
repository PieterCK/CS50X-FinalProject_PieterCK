// Filter for external job searching web
// Global variables
let elems;
let i = 0;

// Anti-spam lock mechanism
var locks= [false,false]
function unlock (x){
    locks[x]= false;
}

// Apply filter to the external page
function extSearch (className) {
    console.log("running extSearch...")
    // Generate Marker Symbols
    let valid = document.createElement("button");
    const validBtn = () => {
        valid.innerHTML = "Not Onboard";
        valid.className="xtIcon xtValid";
    }
    validBtn();
        
    let Invalid = document.createElement("button");
    const InvalidBtn = () => {
        Invalid.innerHTML = "Onboarded";
        Invalid.className="xtIcon xtInvalid";
    }
    InvalidBtn();

    let redirLI = document.createElement("button");
    redirLI.innerHTML = "LinkedIn";
    redirLI.className="xtIcon xtRedirLI";
    
    let comps = document.getElementsByClassName(className)

    for (i; i < comps.length;i++) {
        if (arrayobj[0].includes(comps[i].innerHTML)) {
            let collapsible = comps[i].parentNode
            Invalid.innerHTML = comps[i].innerText;
            collapsible.appendChild();
            collapsible.parentNode.appendChild(Invalid.cloneNode(true));
            collapsible.parentNode.removeChild(collapsible);
            console.log("Invalid");
            i--;
        } else {
            comps[i].parentNode.appendChild(valid.cloneNode(true));
            redirLI.addEventListener('click', function(){
                var url = "https://www.linkedin.com/search/results/all/?keywords=" + comps[i].innerText;
                chrome.tabs.create({ url: url });   
            })
            console.log("Valid Icon");
        }
    }
}

// Messaging 
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(sender.tab ? "from content script" + sender.tab.url : "from the extension");
    console.log("cmnd: ",request.greeting);
    console.log("msg: ",request.message);

    if (request.greeting === "extFilter") {
        var matchingElement = document.evaluate(request.message, document, null, XPathResult.ANY_TYPE, null);
        elems = [];
        let node;
        while (node = matchingElement.iterateNext()) {
            elems.push(node);
        }
    
    } // Get arrayobj
    else if (request.greeting === "arrayobjGet" ) {
        arrayobj=request.message;
    
    } // Run extSearch 
    else if (request.greeting === "run_extSearch") {
        for (let i=0;i < elems.length; i++){
            console.log("Class: ", elems[i].className);
            extSearch(elems[i].className);
        }
    }
})

