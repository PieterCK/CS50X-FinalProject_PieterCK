chrome.tabs.onUpdated.addListener(()=>{
    chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function(tabs) {
        var tab = tabs[0];
        const url = tab.url;
        if (url.includes("/people")) {
            console.log("people tab");
            chrome.tabs.sendMessage(tab.id, {greeting:"Scrape"}, ()=>{
                console.log("sent scrape")
            })
        }
      });
})



