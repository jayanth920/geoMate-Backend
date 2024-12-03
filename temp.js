// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2024-10-28
// @description  try to take over the world!
// @author       You
// @match        https://www.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @grant        GM_webRequest
// @downloadURL https://update.greasyfork.org/scripts/450253/Geoguessr%20Location%20Resolver%20%28Works%20in%20all%20modes%29.user.js
// @updateURL https://update.greasyfork.org/scripts/450253/Geoguessr%20Location%20Resolver%20%28Works%20in%20all%20modes%29.meta.js
// ==/UserScript==


// =================================================================================================================
// 'An idiot admires complexity, a genius admires simplicity'
// Learn how I made this script: https://github.com/0x978/GeoGuessr_Resolver/blob/master/howIMadeTheScript.md
// Contribute things you think will be cool once you learn: https://github.com/0x978/GeoGuessr_Resolver/pulls
// ================================================================================================================

// ==UserScript==
// @name         Geoguessr Location Resolver (Works in all modes)
// @namespace    http://tampermonkey.net/
// @version      12.4
// @description  Features: Automatically score 5000 Points | Score randomly between 4500 and 5000 points | Open in Google Maps
// @author       0x978
// @match        https://www.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @grant        GM_webRequest
// ==/UserScript==


// =================================================================================================================
// 'An idiot admires complexity, a genius admires simplicity'
// Learn how I made this script: https://github.com/0x978/GeoGuessr_Resolver/blob/master/howIMadeTheScript.md
// Contribute things you think will be cool once you learn: https://github.com/0x978/GeoGuessr_Resolver/pulls
// ================================================================================================================

// let globalCoordinates = { // keep this stored globally, and we'll keep updating it for each API call.
//     lat: 0,
//     lng: 0
// }

// let globalPanoID = undefined

// // Below, I intercept the API call to Google Street view and view the result before it reaches the client.
// // Then I simply do some regex over the response string to find the coordinates, which Google gave to us in the response data
// // I then update a global variable above, with the correct coordinates, each time we receive a response from Google.

// var originalOpen = XMLHttpRequest.prototype.open;
// XMLHttpRequest.prototype.open = function(method, url) {
//     // Geoguessr now calls the Google Maps API multiple times each round, with subsequent requests overwriting
//     // the saved coordinates. Calls to this exact API path seems to be legitimate for now. A better solution than panoID currently?
//     // Needs testing.
//     if (method.toUpperCase() === 'POST' &&
//         (url.startsWith('https://maps.googleapis.com/$rpc/google.internal.maps.mapsjs.v1.MapsJsInternalService/GetMetadata') ||
//          url.startsWith('https://maps.googleapis.com/$rpc/google.internal.maps.mapsjs.v1.MapsJsInternalService/SingleImageSearch'))) {

//         this.addEventListener('load', function () {
//             let interceptedResult = this.responseText
//             const pattern = /-?\d+\.\d+,-?\d+\.\d+/g;
//             let match = interceptedResult.match(pattern)[0];
//             let split = match.split(",")

//             let lat = Number.parseFloat(split[0])
//             let lng = Number.parseFloat(split[1])


//             globalCoordinates.lat = lat
//             globalCoordinates.lng = lng
//         });
//     }
//     // Call the original open function
//     return originalOpen.apply(this, arguments);
// };


// // ====================================Placing Marker====================================

// function placeMarker(safeMode){
//     let {lat,lng} = globalCoordinates

//     if (safeMode) { // applying random values to received coordinates.
//         const sway = [Math.random() > 0.5,Math.random() > 0.5]
//         const multiplier = Math.random() * 4
//         const horizontalAmount = Math.random() * multiplier
//         const verticalAmount = Math.random() * multiplier
//         sway[0] ? lat += verticalAmount : lat -= verticalAmount
//         sway[1] ? lng += horizontalAmount : lat -= horizontalAmount
//     }

//     // Okay well played Geoguessr u got me there for a minute, but below should work.
//     // Below is the only intentionally complicated part of the code - it won't be simplified or explained for good reason.
//     // let element = document.getElementsByClassName("guess-map_canvas__JAHHT")[0]
//     let element = document.querySelectorAll('[class^="guess-map_canvas__"]')[0]
//     if(!element){
//         placeMarkerStreaks()
//         return
//     }
//     const keys = Object.keys(element)
//     const key = keys.find(key => key.startsWith("__reactFiber$"))
//     const props = element[key]
//     const x = props.return.return.memoizedProps.map.__e3_.click
//     const y = Object.keys(x)[0]

//     const z = {
//         latLng:{
//             lat: () => lat,
//             lng: () => lng,
//         }
//     }

//     const xy = x[y]
//     const a = Object.keys(x[y])

//     for(let i = 0; i < a.length ;i++){
//         let q = a[i]
//         if (typeof xy[q] === "function"){
//             xy[q](z)
//         }
//     }
// }

// // similar idea as above, but with special considerations for the streaks modes.
// // again - will not be explained.
// function placeMarkerStreaks(){
//     let {lat,lng} = globalCoordinates
//     let element = document.getElementsByClassName("region-map_mapCanvas__R95Ki")[0]
//     if(!element){
//         return
//     }
//     const keys = Object.keys(element)
//     const key = keys.find(key => key.startsWith("__reactFiber$"))
//     const props = element[key]
//     const x = props.return.return.memoizedProps.map.__e3_.click
//     const y = Object.keys(x)
//     const w = "(e.latLng.lat(),e.latLng.lng())}"
//     const v = {
//         latLng:{
//             lat: () => lat,
//             lng: () => lng,
//         }
//     }
//     for(let i = 0; i < y.length; i++){
//         const curr = Object.keys(x[y[i]])
//         let func = curr.find(l => typeof x[y[i]][l] === "function")
//         let prop = x[y[i]][func]
//         if(prop && prop.toString().slice(5) === w){
//             prop(v)
//         }
//     }
// }

// // ====================================Open In Google Maps====================================

// function mapsFromCoords() { // opens new Google Maps location using coords.

//     const {lat,lng} = globalCoordinates
//     if (!lat || !lng) {
//         return;
//     }

//     if (nativeOpen) {
//         const nativeOpenCodeIndex = nativeOpen.toString().indexOf('native code')

//         // Reject any attempt to call an overridden window.open, or fail.
//         // 19 is for chromium-based browsers; 23 is for firefox-based browsers.
//         if (nativeOpenCodeIndex === 19 || nativeOpenCodeIndex === 23) {
//             nativeOpen(`https://maps.google.com/?output=embed&q=${lat},${lng}&ll=${lat},${lng}&z=5`);
//         }
//     }
// }

// // ====================================Controls,setup, etc.====================================


// let onKeyDown = (e) => {
//     if (e.keyCode === 49) {
//         e.stopImmediatePropagation(); // tries to prevent the key from being hijacked by geoguessr
//         placeMarker(true)
//     }
//     if (e.keyCode === 50) {
//         e.stopImmediatePropagation();
//         placeMarker(false)
//     }
//     if (e.keyCode === 51) {
//         e.stopImmediatePropagation();
//         mapsFromCoords(false)
//     }
// }

// document.addEventListener("keydown", onKeyDown);

let globalCoordinates = { // Store coordinates globally.
    lat: 0,
    lng: 0
};

let globalPanoID = undefined;

// Intercept the API call to Google Street View to extract coordinates.
var originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url) {
    if (
        method.toUpperCase() === 'POST' &&
        (url.startsWith('https://maps.googleapis.com/$rpc/google.internal.maps.mapsjs.v1.MapsJsInternalService/GetMetadata') ||
         url.startsWith('https://maps.googleapis.com/$rpc/google.internal.maps.mapsjs.v1.MapsJsInternalService/SingleImageSearch'))
    ) {
        this.addEventListener('load', function () {
            let interceptedResult = this.responseText;
            const pattern = /-?\d+\.\d+,-?\d+\.\d+/g;
            let match = interceptedResult.match(pattern)[0];
            let split = match.split(",");

            let lat = Number.parseFloat(split[0]);
            let lng = Number.parseFloat(split[1]);

            globalCoordinates.lat = lat;
            globalCoordinates.lng = lng;

            console.log(`Coordinates updated: ${lat}, ${lng}`);
        });
    }
    return originalOpen.apply(this, arguments);
};

// ==================================== Sending Coordinates to API ====================================

function sendCoordinatesToAPI() {
    const { lat, lng } = globalCoordinates;
    if (!lat || !lng) {
        console.warn('Coordinates are not available yet!');
        return;
    }

    fetch('https://geomate-backend.onrender.com/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
    })
    .then(response => response.json())
    .then(data => console.log('Location sent:', data))
    .catch(error => console.error('Error sending location:', error));
}

// ==================================== Controls Setup ====================================
/*
let onKeyDown = (e) => {
    if (e.keyCode === 83) { // 'S' key sends the coordinates to the backend.
        e.stopImmediatePropagation();
        sendCoordinatesToAPI();
    }
};

// Add the event listener for key presses.
document.addEventListener("keydown", onKeyDown);
*/


let onKeyDown = (e) => {
    if (e.keyCode === 83) { // 'S' key for sending coordinates to the backend.s
        e.stopPropagation();// Prevent the event from bubbling.
        e.stopImmediatePropagation(); // Stop further propagation of the event.
        e.preventDefault();// Prevent the default action for this key event.
        sendCoordinatesToAPI();// Call your custom function.
    }
};

// Add the event listener with `{ capture: true }` to capture the event earlier.
document.addEventListener("keydown", onKeyDown, { capture: true });

