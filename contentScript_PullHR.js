
// Locks & Unlocks
var locks= [false,false]
function unlock (x){
    locks[x]= false;
}

// HR Puller
const LIScrapper= () => {
    console.log("Scrapper Running...")
    let CheckDiv = document.getElementsByClassName("grid grid__col--lg-8 pt5 pr4 m0 block")
    let CheckPos = document.getElementsByClassName("lt-line-clamp lt-line-clamp--multi-line ember-view")
    let Valids = ["Human Resource", "HR", "CEO", "Talent", "Co-Founder", "Recruit"]
    let Run = true;
    
    let valid = document.createElement("button");
    const validBtn = () => {
        valid.innerHTML = "Pulled";
        valid.className="xtIcon xtValidHR";
    }
    validBtn();

    try {
        while (Run === true) {
            let n = i/2;
            let result = Valids.some(x => CheckPos[i].innerHTML.includes(x));
            if (result) {
                CheckPos[i].parentNode.appendChild(valid.cloneNode(true))
                i=i+2;
            } else {
                CheckDiv[n].parentNode.removeChild(CheckDiv[n])
            }
        }

    } catch(err) {
        console.log("finished")
    }
}

// Create "run" button fo scrapping
const atchBtn= () => {
    console.log("Appending Button...")
    let appendBtn = document.getElementsByClassName("artdeco-card pb2")[0]
    let runBtn = document.createElement("button");
    const cssBtn = () => {
        runBtn.innerHTML = "Pull HR!";
        runBtn.className="org-people__show-more-button t-16 t-16--open t-black--light t-bold";
        runBtn.style.color="white";
        runBtn.style.background= 'linear-gradient(to bottom right, #3755ec, #a1907c)';
        runBtn.style.border= "10px solid white";
        runBtn.style.borderRadius= "32px";
    }
    cssBtn();

    runBtn.addEventListener('click',()=> {
        runBtn.style.background= 'linear-gradient(to bottom left, red, orange)';
        runBtn.innerHTML = "Pulling...";
        let i = 0;
        LIScrapper();
        setTimeout(cssBtn,1000)
    })
    appendBtn.appendChild(runBtn)
}

// Messaging
chrome.runtime.onMessage.addListener((request) => {
    if (locks[0] === false) {
        locks[0] = true; 
        console.log(request.greeting)
        if (request.greeting === "Scrape") {
            atchBtn();
        }
    }

})