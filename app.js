var to = '32.7757,-117.0719'
var from = '32.8801,-117.2340'


var start;
var destination;
var carMake;
var carModel;
var carYear;
var numPassengers;
// var mpg;
var startLatitude;
var startLongitude;
var destinationLatitude;
var destinationLongitude;
var startLocationData;
var destinationLocationData;
var tripSummary;
var tripDistance;

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

function gatherData() {
  start = document.getElementById("start").value.trim();
  destination = document.getElementById("destination").value.trim();
  carMake = document.getElementById("carMake").value;
  carModel = document.getElementById("carModel").value;
  carYear = document.getElementById("carYear").value;
  numPassengers = document.getElementById("numPassengers").value.trim();
  getStartLocationData(start);
  getDestinationLocationData(destination);

  $( document ).ajaxStop(function() {
    startLatitude = getLatitude(startLocationData);
    startLongitude = getLongitude(startLocationData);
    destinationLatitude = getLatitude(destinationLocationData);
    destinationLongitude = getLongitude(destinationLocationData);
    // console.log(startLatitude);
    // console.log(startLongitude);
    // console.log(destinationLatitude);
    // console.log(destinationLongitude);
    drawMap();
    //prepareResults();
  });
  
}

function getStartLocationData(location){
     
    $.ajax({
    url: 'https://geocoder.api.here.com/6.2/geocode.json',
    type: 'GET',
    dataType: 'jsonp',
    jsonp: 'jsoncallback',
    data: {
      searchtext: location,
      app_id: '7SDSJvoRdV0v2xZ0BrAV',
      app_code: 'WPhUiT2gtYoIBPnzf0VoQg',
      gen: '9'
    },
    success: function (data) {
      //alert(JSON.stringify(data));
         
          //lat = data.Response.View[0].Result[0].Location.NavigationPosition[0].Latitude.toString();
          storeStartLocationData(data);
          return data;
        }
      });
}

function getDestinationLocationData(location){
    
    
    $.ajax({
    url: 'https://geocoder.api.here.com/6.2/geocode.json',
    type: 'GET',
    dataType: 'jsonp',
    jsonp: 'jsoncallback',
    data: {
      searchtext: location,
      app_id: '7SDSJvoRdV0v2xZ0BrAV',
      app_code: 'WPhUiT2gtYoIBPnzf0VoQg',
      gen: '9'
    },
    success: function (data) {
      //alert(JSON.stringify(data));
         
          //lat = data.Response.View[0].Result[0].Location.NavigationPosition[0].Latitude.toString();
          storeDestinationLocationData(data);
          return data;
        }
      });
}


function storeStartLocationData(data){
    startLocationData = data;
}

function storeDestinationLocationData(data){
    destinationLocationData = data;
}

function getLatitude(data){
    return data.Response.View[0].Result[0].Location.NavigationPosition[0].Latitude.toString();
}

function getLongitude(data){
    return data.Response.View[0].Result[0].Location.NavigationPosition[0].Longitude.toString();
}

function getTotalDistance(){
    //alert(tripDistance)
    return tripDistance;
}

function getTotalCost(){
    //alert(typeof (tripDistance / getMpg()) * 3.20);
    return totalCosts = (tripDistance / getMpg()) * 3.60;
}

function getTotalCostPerPerson(){
    var totalCosts = (tripDistance / getMpg()) * 3.60;
    return totalCosts / numPassengers;
}

function prepareResults(){
    displayResults();
}

function displayResults(){
    document.getElementById("start-result").innerHTML = start;
    document.getElementById("destination-result").innerHTML = destination;
    document.getElementById("total-distance").innerHTML = +getTotalDistance().toFixed(2) + ' mi';
    document.getElementById("number-of-passengers").innerHTML = numPassengers;
    document.getElementById("total-trip-cost").innerHTML = '$' + +getTotalCost().toFixed(2);
    document.getElementById("cost-per-person").innerHTML = '$' + +getTotalCostPerPerson().toFixed(2);
}

function removeObjectById(id){
    for (object of map.getObjects()){
     if (object.id===id){
         map.removeObject(object);
         }
     }
     
 }

function drawMap() {
  calculateRouteFromAtoB(platform);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////


function calculateRouteFromAtoB(platform) {
  var router = platform.getRoutingService(),
    routeRequestParams = {
      mode: 'fastest;car',
      representation: 'display',
      routeattributes: 'waypoints,summary,shape,legs',
      maneuverattributes: 'direction,action',
      waypoint0: startLatitude + ',' + startLongitude, 
      waypoint1: destinationLatitude + ',' + destinationLongitude
    };


  router.calculateRoute(
    routeRequestParams,
    onSuccess,
    onError
  );
}
/**
 * This function will be called once the Routing REST API provides a response
 * @param  {Object} result          A JSONP object representing the calculated route
 *
 * see: http://developer.here.com/rest-apis/documentation/routing/topics/resource-type-calculate-route.html
 */
function onSuccess(result) {
    var route = result.response.route[0];
    tripSummary = route.summary;  //logs summary of trip chosen
    console.log(tripSummary);
    tripDistance = tripSummary.distance / 1609.344;
    console.log(tripDistance)
    prepareResults();
    


    /*
    * The styling of the route response on the map is entirely under the developer's control.
    * A representitive styling can be found the full JS + HTML code of this example
    * in the functions below:
    */
    addRouteShapeToMap(route);
    addManueversToMap(route);

    addWaypointsToPanel(route.waypoint);
    addManueversToPanel(route);
    addSummaryToPanel(route.summary);
    // ... etc.
}

/**
 * This function will be called if a communication error occurs during the JSON-P request
 * @param  {Object} error  The error message received.
 */
function onError(error) {
  alert('Ooops!');
}

/**
 * Boilerplate map initialization code starts below:
 */

// set up containers for the map  + panel
var mapContainer = document.getElementById('map-container'),
  routeInstructionsContainer = document.getElementById('panel');

//Step 1: initialize communication with the platform
var platform = new H.service.Platform({
  app_id: '7SDSJvoRdV0v2xZ0BrAV',
  app_code: 'WPhUiT2gtYoIBPnzf0VoQg',
  useHTTPS: true
});
var pixelRatio = window.devicePixelRatio || 1;
var defaultLayers = platform.createDefaultLayers({
  tileSize: pixelRatio === 1 ? 256 : 512,
  ppi: pixelRatio === 1 ? undefined : 320
});

//Step 2: initialize a map - this map is centered over Berlin
var map = new H.Map(mapContainer,
  defaultLayers.normal.traffic, {
    center: {
      lat: 32.7757,
      lng: -117.0719
    },
    zoom: 13,
    pixelRatio: pixelRatio
  });

//Step 3: make the map interactive
// MapEvents enables the event system
// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// Create the default UI components
var ui = H.ui.UI.createDefault(map, defaultLayers);

// Hold a reference to any infobubble opened
var bubble;

/**
 * Opens/Closes a infobubble
 * @param  {H.geo.Point} position     The location on the map.
 * @param  {String} text              The contents of the infobubble.
 */
function openBubble(position, text) {
  if (!bubble) {
    bubble = new H.ui.InfoBubble(
      position,
      // The FO property holds the province name.
      {
        content: text
      });
    ui.addBubble(bubble);
  } else {
    bubble.setPosition(position);
    bubble.setContent(text);
    bubble.open();
  }
}


/**
 * Creates a H.map.Polyline from the shape of the route and adds it to the map.
 * @param {Object} route A route as received from the H.service.RoutingService
 */
function addRouteShapeToMap(route) {
  var lineString = new H.geo.LineString(),
    routeShape = route.shape,
    polyline;

  routeShape.forEach(function (point) {
    var parts = point.split(',');
    lineString.pushLatLngAlt(parts[0], parts[1]);
  });

  polyline = new H.map.Polyline(lineString, {
    style: {
      lineWidth: 4,
      strokeColor: 'rgba(0, 128, 255, 0.7)'
    }
  });
  // Add the polyline to the map
  polyline.id = "route";
  map.addObject(polyline);
  // And zoom to its bounding rectangle
  map.setViewBounds(polyline.getBounds(), true);
}


/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addManueversToMap(route) {
  var svgMarkup = '<svg width="18" height="18" ' +
    'xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="8" cy="8" r="8" ' +
    'fill="#1b468d" stroke="white" stroke-width="1"  />' +
    '</svg>',
    dotIcon = new H.map.Icon(svgMarkup, {
      anchor: {
        x: 8,
        y: 8
      }
    }),
    group = new H.map.Group(),
    i,
    j;

  // Add a marker for each maneuver
  for (i = 0; i < route.leg.length; i += 1) {
    for (j = 0; j < route.leg[i].maneuver.length; j += 1) {
      // Get the next maneuver.
      maneuver = route.leg[i].maneuver[j];
      // Add a marker to the maneuvers group
      var marker = new H.map.Marker({
        lat: maneuver.position.latitude,
        lng: maneuver.position.longitude
      }, {
        icon: dotIcon
      });
      marker.instruction = maneuver.instruction;
      group.addObject(marker);
    }
  }

  group.addEventListener('tap', function (evt) {
    map.setCenter(evt.target.getPosition());
    openBubble(
      evt.target.getPosition(), evt.target.instruction);
  }, false);

  // Add the maneuvers group to the map
  group.id = "route";
  map.addObject(group);
}


/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addWaypointsToPanel(waypoints) {
  var nodeH3 = document.createElement('h3'),
    waypointLabels = [],
    i;
  for (i = 0; i < waypoints.length; i += 1) {
    waypointLabels.push(waypoints[i].label)
  }

  nodeH3.textContent = waypointLabels.join(' - ');

  routeInstructionsContainer.innerHTML = '';
  routeInstructionsContainer.appendChild(nodeH3);
}

/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addSummaryToPanel(summary) {
   
  var summaryDiv = document.createElement('div'),
    content = '';
  content += '<b>Total distance</b>: ' + summary.distance + 'm. <br/>';
  content += '<b>Travel Time</b>: ' + summary.travelTime.toMMSS() + ' (in current traffic)';


  summaryDiv.style.fontSize = 'small';
  summaryDiv.style.marginLeft = '5%';
  summaryDiv.style.marginRight = '5%';
  summaryDiv.innerHTML = content;
  routeInstructionsContainer.appendChild(summaryDiv);
}

/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addManueversToPanel(route) {



  var nodeOL = document.createElement('ol'),
    i,
    j;

  nodeOL.style.fontSize = 'small';
  nodeOL.style.marginLeft = '5%';
  nodeOL.style.marginRight = '5%';
  nodeOL.className = 'directions';

  // Add a marker for each maneuver
  for (i = 0; i < route.leg.length; i += 1) {
    for (j = 0; j < route.leg[i].maneuver.length; j += 1) {
      // Get the next maneuver.
      maneuver = route.leg[i].maneuver[j];

      var li = document.createElement('li'),
        spanArrow = document.createElement('span'),
        spanInstruction = document.createElement('span');

      spanArrow.className = 'arrow ' + maneuver.action;
      spanInstruction.innerHTML = maneuver.instruction;
      li.appendChild(spanArrow);
      li.appendChild(spanInstruction);

      nodeOL.appendChild(li);
    }
  }

  routeInstructionsContainer.appendChild(nodeOL);
}


Number.prototype.toMMSS = function () {
  return Math.floor(this / 60) + ' minutes ' + (this % 60) + ' seconds.';
}

// Now use the map as required...
calculateRouteFromAtoB(platform);

// Geolocation button functionality
var geoloc = document.getElementById('geolocation');
var onClick = function () {
  if (geoloc.className != 'active') {
    geoloc.className = 'active';
    var icon = new H.map.Icon('https://material.io/tools/icons/static/icons/sharp-person_pin_circle-24px.svg', {
      w: 50,
      h: 50
    });
    navigator.geolocation.getCurrentPosition(function (position) {
      window.marker = new H.map.Marker({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }, {
        icon: icon
      });
      map.addObject(marker);
      console.log(position);
    });
  } else {
    geoloc.className = '';
    map.removeObject(marker);
  }
};




geoloc.addEventListener('click', onClick);