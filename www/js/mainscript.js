var pages =[];
var links =[];
var numLinks = 0;
var numPages = 0;
var names = [];
var toSaveItemArray=[];
var waitingMessage; 
var randomContactPara;

var curLatitude;
var curLongitude;
var curSelectedContactIndex;

//---------array for every marker -----------
var markersArray = [];
var gMap;

//when content ready and device ready, fire setup function; 
document.addEventListener('DOMContentLoaded', function(){
    document.addEventListener('deviceready', setup);
});
//create the pageShow type event.
var pageshow = document.createEvent("CustomEvent");
pageshow.initEvent("pageShow", false, true);

//document.addEventListener("deviceready", function () {
function setup(){
    console.log("content ready and device ready now...")
    //----------set up initial state for the overlay div and modal dialog div -------------
    document.querySelector("[data-role=modal]").style.display="none";
    document.querySelector("[data-role=overlay]").style.display="none";

    //----------set up btnOK click listener so once it is clicked, the modal and overlay divs
    //----------will be hidden again----------------
    document.querySelector("#btnOK").addEventListener("click", function(){
        document.querySelector("[data-role=modal]").style.display="none";
        document.querySelector("[data-role=overlay]").style.display="none";
    });

    //-----------attach backbtn click listener so once clicked, the home div will be displayed and
    //-----------the map div will be hidden again--------
    document.querySelector("#backbtn").addEventListener("click", function(ev){
        document.querySelector("#home").className="show";
        document.querySelector("#map").className = "hidden";
    });
    //--------load contact list -------
    loadContactList();
    //--------handling history (back) button ----------
    window.addEventListener("popstate", function( ev ){
      //this will handle the back button and forward button if clicked.  
        console.log( ev.state );
        console.log( location.href );
        document.querySelector("#home").className = "show";
        document.querySelector("#map").className = "hidden";
      //document.querySelector
      //navigate( location.href, false );
    //don't add this call to the history... it is already there.
    });


    document.querySelector("#theMap")
    //--------get current location -------------
    if (navigator.geolocation) {
        //code goes here to find position
        var params = {
            enableHighAccuracy: true,
            timeout: 360000,
            maximumAge: 0
        };
        navigator.geolocation.getCurrentPosition(watchPosition, gpsError, params);
    }
    
};
//});


function deleteOverlays() {
  if (markersArray) {
    for (i in markersArray) {
      markersArray[i].setMap(null);
    }
    markersArray.length = 0;
  }
}

function browserBackButton(ev) {
    url = location.hash; //hash will include the "#"
    //update the visible div and the active tab
    numPages = pages.length;
    for (var i = 0; i < numPages; i++) {
        if (("#" + pages[i].id) == url) {
            pages[i].style.display = "block";
        } else {
            pages[i].style.display = "none";
        }
    }
    for (var t = 0; t < links.length; t++) {
        //links[t].className = "";
        if (links[t].href == location.href) {
            //links[t].className = "activetab";
        }
    }
}



function watchPosition(position) {
    curLatitude = position.coords.latitude;
    curLongitude = position.coords.longitude;
    console.log("curLatitude = "+curLatitude);
    console.log("curLongitude = "+curLongitude);

    var map;        //this will be the global reference to your map object
    var myLatlng = new google.maps.LatLng(curLatitude,curLongitude);
    var myOptions = {
                zoom: 14,
                center: myLatlng,
                disableDoubleClickZoom: true,
                mapTypeId: google.maps.MapTypeId.ROADMAP
                }


    gMap =new google.maps.Map(document.querySelector("#theMap"), myOptions);

    google.maps.event.addListener(gMap, 'dblclick', function(event) {

            deleteOverlays();
            //mapZoom = gMap.getZoom();
            startLocation = event.latLng;
            var marker = new google.maps.Marker({
                position: startLocation,
                animation: google.maps.Animation.BOUNCE,
                map: gMap
            });
            markersArray.push(marker);

            toSaveItemArray[curSelectedContactIndex].lat = startLocation.lat();
            toSaveItemArray[curSelectedContactIndex].lng = startLocation.lng();

            localStorage.setItem("contactlist-yuan0037", JSON.stringify(toSaveItemArray));  
           
    });


    // gMap.setOptions( {
    //     zoomControl: true,
    //     maxZoom: 17,
    //     minZoom: 12,
    //     zoomControlOptions: {
    //         position: google.maps.ControlPosition.RIGHT_CENTER  
    //     },
    //     streetViewControl: false
    // } );

}

function gpsError(error) {
    var errors = {
        1: 'Permission denied',
        2: 'Position unavailable',
        3: 'Request timeout'
    };
    alert("Error: " + errors[error.code]);
}

function loadContactList() {
    
    console.log("load contact list now");
    var contactsDiv = document.querySelector("#contactListDiv");
    while (contactListDiv.firstChild) {
        contactsDiv.removeChild(contactListDiv.firstChild);
    }

    var options = new ContactFindOptions();
    options.filter="";          // empty search string returns all contacts
    options.multiple=true;      // return multiple results
    filter = ["name","displayName", "phoneNumbers"];   // return contact.displayName field
    // find contacts
    navigator.contacts.find(filter, onSuccess, onError, options);
}

//-----------define a custom class to hold contact information
//---------- in order to match the json format in the requirements
function myContact(id, name, numbers,  lat, lng) { 
    this.id = id;
    this.name = name;
    this.numbers = numbers;
    this.type = "myContactYuan0037"
    this.lat = lat;
    this.lng = lng;
 
}
//-----------define a custom class to hold mobile and home numbers
//-----------used in the myContact class 
function myNumbers(mobileNumber, homeNumber){
    this.mobile = mobileNumber;
    this.home = homeNumber;
}


//-------------------when load contact list finished successfully --------
function onSuccess(contacts) {
    console.log("contacts count = " + contacts.length);

    if (contacts.length>0) 
    {
        var contactsDiv =  document.querySelector("#contactListDiv");
        var ol = document.createElement("ol");
        contactsDiv.appendChild(ol);
        var internalCount = 0;
        for (var i=0; i<contacts.length; i++) 
        {
            //-------------only show the contact that has a non-empty displayName -----------
            if (contacts[i].displayName)
            {
                internalCount++;
                var li = document.createElement("li");
                ol.appendChild(li);
                var mc = new Hammer.Manager(li);
                // Default, tap recognizer
                mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2, threshold: 5, posThreshold: 30}) );
                // Single tap recognizer
                mc.add( new Hammer.Tap({ event: 'singletap' , taps: 1, threshold: 5}) );

               
                mc.get('doubletap').recognizeWith('singletap');
                mc.get('singletap').requireFailure('doubletap');

                //mc.add( new Hammer.Pan());
                mc.on("singletap doubletap", function(ev) {
                    
                    curSelectedContactIndex = ev.target.getAttribute("contactID");

                    console.log("contactid = "+curSelectedContactIndex);
                    if (ev.type == "singletap")
                    {
                        
                        var itemVal = ev.target.innerHTML;
                        document.querySelector("#modalDialogName").innerHTML = "Name: " + toSaveItemArray[curSelectedContactIndex].name;
                        document.querySelector("#modalDialogMobile").innerHTML = "Mobile Number: "+ toSaveItemArray[curSelectedContactIndex].numbers.mobile;
                        document.querySelector("#modalDialogHome").innerHTML = "Home Number: " + toSaveItemArray[curSelectedContactIndex].numbers.home;

                        document.querySelector("[data-role=modal]").style.display="block";
                        document.querySelector("[data-role=overlay]").style.display="block";
                    }
                    else if (ev.type=="doubletap")
                        {
                            console.log("doubletap detected");
                            history.pushState(null, null, "#map");
                            document.querySelector("#home").className = "hidden";
                            document.querySelector("#map").className = "show";
                            deleteOverlays();
                            if ((toSaveItemArray[curSelectedContactIndex].lat == null) && (toSaveItemArray[curSelectedContactIndex].lng == null))
                            {
                                alert("Double tap on the map to set the position for the current contact");
                                //-----------the next line of code is required otherwise 
                                //-----------google map will only show a small area at the top-left corner
                                google.maps.event.trigger(gMap, 'resize');
                                gMap.setCenter(new google.maps.LatLng(curLatitude, curLongitude));
                            }
                            else 
                            {
                                google.maps.event.trigger(gMap, 'resize');
                                gMap.setCenter(new google.maps.LatLng(toSaveItemArray[curSelectedContactIndex].lat, toSaveItemArray[curSelectedContactIndex].lng));

                                var marker = new google.maps.Marker({
                                    position: new google.maps.LatLng(toSaveItemArray[curSelectedContactIndex].lat, toSaveItemArray[curSelectedContactIndex].lng),
                                    animation: google.maps.Animation.BOUNCE,
                                    map: gMap
                                });
                                markersArray.push(marker);
                            }

                        }
                });

                var mobileNumber = "";
                var homeNumber = "";
                li.innerHTML =  contacts[i].displayName; //contacts[i].name.givenName +" "+ contacts[i].name.familyName+" - "+
                //--------set up contactID property for each "li"
                //--------contactID property is set to the same value of the
                //------- "id" property of
                //--------myContact object that is saved to localstorage later. 
                li.setAttribute("contactID", internalCount-1);
                if (contacts[i].phoneNumbers)
                {
                    for (var j=0; j<contacts[i].phoneNumbers.length; j++) 
                    {
                         //console.log("Type: " + contacts[i].phoneNumbers[j].type + "\n" + 
                         //      "Value: "  + contacts[i].phoneNumbers[j].value + "\n" + 
                         //      "Preferred: "  + contacts[i].phoneNumbers[j].pref);
                        if (contacts[i].phoneNumbers[j].type == "mobile")
                        {
                            mobileNumber = contacts[i].phoneNumbers[j].value;
                        }
                        else if (contacts[i].phoneNumbers[j].type == "home")
                        {
                            homeNumber = contacts[i].phoneNumbers[j].value;
                        }
                    }
                }
                //----------create a myContact object and add it to the array
                var curMyContact = new myContact(internalCount-1, contacts[i].displayName, new myNumbers(mobileNumber, homeNumber), null, null);
                toSaveItemArray.push(curMyContact);

                //----------maximum displayed items are 12 ------------
                if (internalCount>=12) 
                {
                    break;
                }


            }
        }
    }
    else
    {
        //------------address book is empty, do nothing ---------------
         //randomContactPara.innerHTML = "Contact list is empty.";
    }
    if (toSaveItemArray.length>0)
        localStorage.setItem("contactlist-yuan0037", JSON.stringify(toSaveItemArray));  
    
//        then = (new Date()).getTime();
//    console.log("Time = " + (then-now));
}

function onError(){
    console.log("error happend during locating contact");
}