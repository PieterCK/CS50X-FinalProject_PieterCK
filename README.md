# TITLE: HELPER OI
#### Video Demo:  <https://youtu.be/q_36xZwGzvI>
#### Description:
 
## Overview & Problems Statement
Currently I'm an intern at a Vietnamese company as part of the sales division. The main work is approaching hiring companies through many online platforms but mainly LinkedIn to offer them a free trial of our product.
 
Helper OI is a browser extension designed to help me and my colleagues with our job. The first problem to tackle is to help avoid approaching and “onboarding” (register the client to our app) companies who’ve been onboarded before. To do that, the *first feature: LinkedIn Filter+* would be a built-in filter tailored to the DOM tree and inner workings of LinkedIn job search page. It will hide job posts from companies who’ve been onboarded and mark job posts from the companies that have not been on boarded yet. Consequently, this feature also increases efficiency since repeatedly searching in gsheet for company name can be avoided. Additionally, there’s also the *second feature: External Web Filter* which basically have the same function and purpose of the first feature but for other online job posting websites. Of course, it being designed to be applicable for every other website other than LinkedIn does present some drawbacks that will be discussed further later.
 
Once an intern found a suitable company to approach, we proceed to try to find HR employees from the company to offer them the free trial. Some job post might not display the hiring person, and scroll through their employee list to find the HR team in the companys' LinkedIn profile can quickly becomes tedious and time consuming if the company has 1000+ or more employees. This problem brings us to the *third function: HR Puller*, which is a function initiated through a custom button appended at the company’s LinkedIn profile by Helper OI. Once clicked, it will sift through the displayed list of employees and tag employees that might be relevant (think of managers, HRs, CEO)for us to approach and hide the ones that do not.
 
Other *supporting features* includes; a note menu where you can copy and paste templates of messages when approaching a company, a blacklist function, a LinkedIn search menu for convenience when you don't have LinkedIn open, you can even upload CSV for the filter file and lastly a pseudo login function where you can enter a username and all uploaded CSV files as well as your blacklisted companies will be saved (persists).
## Helper OI Main Components
Since HelperOI is a browser extension, it mainly consists of :
```
A Manifest.json file
3 contentScript.js files
A popup.html file
A popupScript.js file
A module: papaparse.min.js
A default filter csv file: CompList.CSV
An assets folder: .png files
```
Content script files directly interact with the specific tab the user is in. When designing a function it is important to consider when and where it should be fired. A feature only for a specific web page such as the LinkedIn Filter+ and HR Puller should only activate when the user is in the appropriate web page, while a feature such as the External Web Filter can be applied to many different websites. This is the reason for 3 different content script files instead of one. Through manifest.json or background.js we can decide which script should be applied in the current tab. Thus, the next sections will mainly focus on the inner workings and design choices for content script file with limited explanation for the other parts. 
### contentScript_Search.js
contetnScript_Search contains the mechanism for the *first function: LinkedIn Filter +*. The purpose of this contentScript file is to append an element next to the company name displayed on the LinkedIn job search page indicating whether the company should be approached or not. If it is in the list of onboarded companies the script will hide the job post and append an element marking that the company has already been onboarded, and if it isn’t then the script will append an element next to the company name highlighting that it has not been on boarded yet. The function responsible for that specific purpose can be found under the name of ‘LILoaded()’. 
 
‘LILoaded()’ first generates two elements which will later be appended to the web page. An ‘invalid’ element and a ‘valid’ element in the form of a button (for aesthetic purpose). It will then receive the displayed company names from the page under the variable ‘CompName’ which will be iterated one by one against a CSV containing the list of onboard companies stored in the ‘arrayObj’ variable. It will then append the appropriate icon element in the parent node of the element contained in ‘CompName’. The second purpose of LILoaded() is to rearrange the job post itself, it will un-append and re-append several elements in the job post so that we can immediately see how many employees the company has without having to scroll down.
 
Of course by now there are several unmentioned variables such as ‘arrayObj’ as well as when and how to fire LILoaded(). Thus, next we will discuss all the other components of contentScript_Search.js that make it possible to run ‘LILoaded()’ smoothly and appropriately.
 
Since the run button is not in the script nor does contentScrip_Search.js have the CSV file for the filter, to run ‘LILoaded()’ the script will first have to communicate with other parts of the extension namely the popupScript.js which is the only js file capable of parsing the CSV file for the filter since it is connected to the popup.html and the papaparse.min.js. Thus this brings us to the “Messaging” part of contentScript_search.js where the purposes of this component are:
```
to receive the order to run LILoaded, 
to receive the CSV file containing a list of onboarded companies and 
to receive the blacklist. 
```
To do that, I’m using the onMessage & sendMessage function to establish communication between the extension parts. The messaging system is set up to receive two variables, a “message” containing a command and a “greeting” containing data such as a parsed CSV file. Upon receiving the message:”RunLILoaded”, contentScrip_Search will know that the “greeting” will contain the CSV file and will then register it to the ‘arrayObj’ variable I’ve declared globally. The same mechanism is applied for the “Run” button which will fire LILoaded() and blacklist variable received will also be pushed to arrayObj inside the Messaging part.
 
By now we should be able to apply the filter to the LinkedIn job search page through the browser menu by clicking the ”Run” button. However, when scrolling down the job list we will notice that LinkedIn is loading the job post on the fly as we scroll down. This means that we have to re-run LILoaded() everytime a new job post is loaded. To solve this problem I’ve come up with two different solutions. Ultimately, only one is used. Here’s the two solutions and their drawbacks:  

#### Append re-append method
Using the exact same mechanism I’ve used to pull up an unloaded element in the job post; 
Start from checking the top most post on the job list and apply an appropriate icon to it (valid / invalid) and then re append it to the bottom of the list. 
The job post that was initially second on the list now becomes the first and the process repeats 
until a certain number of job posts has been processed(around 26/27) signalling that it has finished processing all of the job posts.
Append a div with a unique class to the top of the job list to mark the end of the process (*this will be important later*)
With this method, the initial drawback is ofcourse the user would have to wait for the whole process to finish which isn’t that slow at all but it was costly. The whole process would only take a few seconds but produces a noticeable lag. One important note to take is that the whole job list is essentially not the original ones LinkedIn has appended to the job list (*this will be important later*). The benefit of using this technique is less code since I only have to reuse the same method I’ve already employed in the LILoaded() but with adjustment to the DOM of the job list. 

#### Observer & Update Method
This approach mimics the same mechanism of the LinkedIns’ own job list behaviour where only when the user is scrolling down and generating a new job post will then the LILoaded be fired to process the new batch of job posts on the list.
A function will observe (keep track of) any updates on the job list element on LinkedIn. This will let the script know whether any new job post has been generated or not.
Once an update has been recognized, the function will fire LILoaded() to process the newly loaded job posts.
The main drawback of this method is that it is a little more complex relative to the first method and would also produce a little lag since it’s keeping track of any updates and thus firing LILoaded in  succession. Additional functions that needed to be implemented would first be the function to observe any updates being done in the job list element. This function uses the Mutation Observer method to keep track of changes in a particular element in the DOM. Once a type of change has occurred, then LILoaded will be fired. The second very important function to be implemented is the throttling or rate limiting function. This function is very crucial in conserving resources since the Mutation Observer function is reacting to every update on the specified element and thus has proved to use computer resources heavily if not managed carefully. The throttling function has a parameter that accepts another function and a duration of delay in milliseconds. Once the function has been throttled, it can only be called again  once the set amount of delay has finished. I have implemented several simple “locks” also to conserve computer resources by only activating the Mutation Observer function when the “Run” button has been clicked. 

In the end, I chose the second solution since there’s a fatal flaw in the first function caused by the quirks of how LinkedIn works. When switching to a different page, all the re-appended job posts in the list will stay and continue to the bottom of the next list. This would require additional work around such as deleting previous job posts after processing the new list and stopping at div with unique class at the end of the previous list that were brought to the new page. It seems like it is caused by LinkedIn not recognizing the re-appended job posts so it won’t remove it when loading a new page even though all the re–appended elements are similar down to class names and IDs. The first solution also has some edge cases such as a flawed system to keep track when to stop processing the job list, for example the very last page of the job list usually only has less than 26 job posts so it may not work as intended. The second solution works fine but does need some adjustment while implementing the next function, the function to reset prepare for the new list when proceeding to the next job list page.
Next, we’ll be discussing the last crucial function of contentScript_search.js, the page button adjustment function.
 
Notice that the variable “i” used in the for-loop inside LILoaded() is a global variable so that it wont reset every time LILoaded() is called. This is a deliberate design because if it resets every time LILoaded() is fired, then it would have to process the job posts twice when a new one has loaded. The variable “I” then, should only reset when the user enters a new page. Thus, the navigation button should have an additional event listener for this purpose. The function is called ‘updtBtn’ which has a couple of locking systems implemented, the fist one is to prevent the script adding an event listener too many times since we only need to fire the function once in every page and will reset once the new page has finished loading. Inside ‘updtBtn’, a for-loop will iterate through the 10 buttons on the bottom of the job list used to navigate the job page, adding event listeners to each button. The event listeners will listen for clicks and will reset the variable “I” and activate a lock that will disable LILoaded() only to be unlocked again once a set amount of time (2s) has passed. This is a deliberate design because of how the LinkedIn page works. It seems like when skipping some pages when navigating through the job list, for example going from page 5 to page 9 the job list actually goes through some of the job pages in between page 5 and 9. The result, is that when we finally arrived at page 9 the variable “I” used to track where we are in the job list has been “used”, meaning its value won't be 0 like intended but somewhere between 20-30 since LILoaded was processing a couple of job lists in a flash before arriving at page 9. A locking system activated when navigating the page will prevent such cases from happening.
 
Lastly, contentScript_Search.js does have a little cosmetic function whose purpose is to append a “status” button at the very top of the job list. This function will read the name of the current file for the filter data and display it on a button element that will be automatically appended on LinkedIn. 
### contentScript_Ext.js
The ContentScript_Ext.js file houses the *second feature: External Web Filter*. A lot of the design choices and mechanism is similar to LILoaded() in contentScript_Search.js but without the function to rearrange LinkedIn job posts. 
 
The main difference would be the method to determine the elements containing the job list in each website since we don’t want to look into each web page's DOM to figure it out. Thus, to run External Web Filter the user would have to enter a company name inside the job list on the website they are in. popupScript.js will try to figure out what class does an element with the inner HTML of the previously inputted company name using Xpath. That means the messaging system for contentScript_search.js will also support this function by sending the identified class name alongside arrayObj and the blacklist. 
 
Noticeable drawback or downgrade of the External Web Filter is the lack of the Observe & Update Function since each job page may employ different techniques to load their job lists. 
 
### contentScript_PullHR.js
The *third feature : HR Puller* is built inside contentScript_PullHR.js file, which employs a familiar method of scrapping the company’s employee list in their LinkedIn profile. It uses the same method in the LILoaded() in contentScript_Search.js file where the function ‘LIScrapper()’ will tag employees in relevant positions as well as hiding the ones that do not. To do that, it follows a simple algorithm: 
 Once fired, the script will look at the first employee on the list. It will check their position description.
If it includes one or more specified key words(
> let Valids = ["Human Resource", "HR", "CEO", "Talent", "Co-Founder", "Recruit"])
It will append a “Pulled” button element to mark that they fit the criteria.
If it doesn’t, then the script will simply just un-append the parent node of the element.
If it finds a valid employee, the script will proceed to continue processing the second job post(i + +) and if it hides the previous one it will continue processing for the next employee that filled the position of the previously hidden employee (i stays the same).
The whole process will continue until it runs out of displayed employees to process. The whole process can be repeated by clicking the “Pull” button once new employees have finished filling the page again.
The whole process is initiated by  a click of a button called “Pull” that will be automatically appended to the company LinkedIn profile page. It is not designed to continue checking all of the employee list and only the displayed employees since most of the time HR employees are only a couple of clicks away and the whole process does take a noticeable amount of resources if run continuously. 
 
### manifest.json file
Finally, the manifest.json ties all of the different parts of the extension together into a concrete application. Inside, I specified which version of manifest is it (Manifest V.3), which files get to be the contentScripts and which contentScripts run at what page. As previously said, contentScript_Search will only run when the user is on LinkedIn job search page ("https://www.linkedin.com/jobs/search/*"), contentScript_PullHR on the LinkedIn company profile under the “People” tab ("https://www.linkedin.com/company/*/people") and contentScript_ext.js on all website(<all_url>).
 
 
 
 
