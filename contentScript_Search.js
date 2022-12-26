(() => {
    // Global Variables
    let arrayobj = undefined;
    let i = 0;
    let button;
    let source;
    // Throttle Mechanism (to avoid spam)
    function throttle(callback, limit) {
        let wait = false;
        return function () {
            if (!wait) {
                callback.apply(null, arguments);
                wait = true;
                setTimeout(() => {
                    wait = false;
                }, limit);
            }
        }
    }

    let lock1 = false;
    let lock2 = false;
    let lockUdpt = true;
    function unlock1() {
        lock1 = true;
    }

    // Load Symbols
    const LILoaded = () => {
        // Moves Job Infos to Top
        let div1 = document.getElementsByClassName("jobs-unified-top-card")[0].parentNode
        let div2 = document.getElementsByClassName("jobs-box--fadein jobs-box--full-width jobs-box--with-cta-large jobs-description")[0]
        let maindiv = document.getElementsByClassName("jobs-details__main-content jobs-details__main-content--single-pane full-width")[0]

        div1 = maindiv.removeChild(div1)
        div2 = maindiv.removeChild(div2)

        maindiv.appendChild(div1)
        maindiv.appendChild(div2)

        // Get Elements Containing Lists to Company Names & its' Staff Number
        CompName = document.getElementsByClassName("job-card-container__company-name");
        // Generate Marker Symbols
        let valid = document.createElement("button");
            valid.innerHTML = "Not Onboard";
            valid.className = "xtIcon xtValid";

        let Invalid = document.createElement("button");
            Invalid.innerHTML = "Onboarded";
            Invalid.className = "xtIcon xtInvalid";

        // Iterate Through Startup Oi's Onboarded Company List
        for (i; i < CompName.length; i++) {
            console.log('Company Name', CompName[i].innerText);
            if (arrayobj[0].includes(CompName[i].innerText)) {
                let collapsible = CompName[i].parentNode.parentNode.parentNode.parentNode
                Invalid.innerHTML = CompName[i].innerText;
                collapsible.parentNode.appendChild(Invalid.cloneNode(true));
                collapsible.parentNode.removeChild(collapsible);
                console.log("Invalid");
                i--;
            } else {
                CompName[i].parentNode.appendChild(valid.cloneNode(true));
                console.log("Valid Icon");
            }
        }
    }
    let throttledLILoaded = throttle(LILoaded,100);

    //Messaging > popupScript.js
    chrome.runtime.onMessage.addListener((request) => {
        if (request.greeting === "RunLILoaded") {
            lockUdpt = false;
            LILoaded();
            cssBtnRun();
        } else if (request.greeting === "arrayobjGet") {
            arrayobj = request.message;
            source= request.source;
            console.log("Filter File: ", source)
        } else if (request.greeting === "blacklists") {
            let blistObj = request.message
                arrayobj[0] = arrayobj[0] + blistObj
        }
    });

    // Add event listeners for page nav buttons
    function updtBtn() {
        for (let n = 0; n < 10; n++) {
            button[n].children[0].addEventListener('click', function () {
                lock1 = true;
                lock2 = false;
                setTimeout(function (){
                    i = 0;
                    lock1 = false
                    runUpdt();
                },2000)
            })
        }
    }

    // Observe job search list
    const Joblist = document.getElementsByClassName("scaffold-layout__list-container")[0];
    const config = { attributes: true, childList: true, subtree: true };
    
        function runUpdt() {
            button = document.getElementsByClassName("artdeco-pagination__indicator artdeco-pagination__indicator--number ember-view");
            if (button !== undefined && lock2 === false) {
                lock2 = true;
                updtBtn();
            }
            
            if (arrayobj !== undefined && lock1 === false) {
                throttledLILoaded();
                setTimeout(LILoaded,300);
            } 
        }
        let throttleRunUpdt = throttle(runUpdt, 200);

    function callback (mutationList, observer) {
        for (const mutation of mutationList) {
            if (mutation.type === 'childList' && lockUdpt === false) {
                throttleRunUpdt();
            }
        }
    }

    const observer = new MutationObserver(callback);
    observer.observe(Joblist, config);

    // Install status button
    let heading = document.getElementsByClassName("scaffold-layout__list-header jobs-search-results-list__header--blue")[0]
    let runBtn = document.createElement("button");
    runBtn.className = "t-16 truncate jobs-search-results-list__text xtRunBtn";
    runBtn.innerHTML = "No Filter";

    const cssBtnRun = () => {
        let dataDsply = "Data: "+ source;
        runBtn.style.background = 'linear-gradient(to bottom left, red, orange)';
        runBtn.innerHTML = dataDsply;
    }
    heading.appendChild(runBtn);

})();

