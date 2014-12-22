/**
 * Pebble Home project
 *
 * A simple app to make call to a Z-Way url
 * By Alex
 */

//////////////
//Requires
var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Settings = require('settings');

////////////////////
// Setting config

var options = Settings.option();//Loading saved values

Settings.config(
  { url: 'http://darkar.free.fr/pebble/settings.html?' + encodeURIComponent(JSON.stringify(options))},
  function(e) {
		//Callback on opening
    console.log('opening configurable');
		console.log(JSON.stringify(options));
  },
  function(e) {
		//Callback on closing
		// Show the parsed response
    console.log(JSON.stringify(e.options));

    // Show the raw response if parsing failed
    if (e.failed) {
      console.log(e.response);
    }
    console.log('closed configurable');
  }
);

//////////////////
//loading config

var error = new UI.Card();
error.title('Heating system');
error.subtitle('Error');

var host = options.host;
var port = options.port;
var deviceNumber = options.number;

if(host === "" || port === "" || deviceNumber === ""){
	error.body('App wasn\'t fully configured...');
	error.show();	
	return;
}


/////////
//Init
var urlBase = "http://" + host + ":" + port + "/ZWaveAPI/Run/devices[" + deviceNumber +"].instances[0]";
var urlTurnON = urlBase + ".SwitchBinary.Set(255)";
var urlTurnOFF = urlBase + ".SwitchBinary.Set(0)";
var urlGetStatus = urlBase + ".commandClasses[37].Get()";
var urlGetData =  "http://" + host + ":" + port + '/ZWaveAPI/Data/';

///////////////////
// Get status and display main screen

//Main window is a freeform UI
var wind = new UI.Window();

//Title label
var title = new UI.Text({
	position: new Vector2(10, 40),
	size: new Vector2(124, 30),
	font: 'gothic-24-bold',
	text: 'Pebble Home',
	textAlign: 'left'
});
wind.add(title);

//Status label
var statusLabel = new UI.Text({
	position: new Vector2(10, 70),
	size: new Vector2(124, 30),
	font: 'gothic-18-bold',
	text: 'Status: loading...',
	textAlign: 'left'
});
wind.add(statusLabel);

//On label next to the UP button
var onLabel = new UI.Text({
	position: new Vector2(90, 10),
	size: new Vector2(40, 20),
	font: 'gothic-24-bold',
	text: 'ON >',
	textAlign: 'right'
});
wind.add(onLabel);

//Off label next to the DOWN button
var offLabel = new UI.Text({
	position: new Vector2(80, 114),
	size: new Vector2(50, 20),
	font: 'gothic-24-bold',
	text: 'OFF >',
	textAlign: 'right'
});
wind.add(offLabel);

wind.show();//Loading screen...

getCurrentStatus(statusLabel);//Updates the screen with the current status

bindUpHandler(wind,statusLabel);
bindDownHandler(wind,statusLabel);


/////////////
//Functions

//Z-Way protocol requires to make a "status" request before getting the value in a second request
//Once the status request has been made we need to save the timestamp (minus one second to be sure) as the second request will need it as a parameter
//Details of the protocol in http://razberry.z-wave.me/docs/zwayDev.pdf
function getCurrentStatus(label){
	var timestampUpdate = (Math.floor(Date.now() / 1000) - 1);//We need the timestamp for the "get"" request
	ajax({url: urlGetStatus, type:'json'},
			function(data){
				//success
				//Second request to get the current value of the switch
				setTimeout(function(){ updateCurrentStatus(label,timestampUpdate) }, 1000);
			},
			function(error){
				//error
				console.log(error);
			});
}

//This function gets the value of the Z-Wave switch and updates the label accordingly
function updateCurrentStatus(label,ts){
	var currentUrl = urlGetData + ts;	
	ajax({url: currentUrl, type:'json'},
		function(data){
			//This Ajax call returns an associative array of changes in Z-Way data tree since <timestamp>. For more details see http://razberry.z-wave.me/docs/zwayDev.pdf
			//Get the status in the json response
			if(typeof data["devices."+deviceNumber+".instances.0.commandClasses.37.data.level"] !== "undefined"){
				var isOn = data["devices."+deviceNumber+".instances.0.commandClasses.37.data.level"]["value"];
				if(isOn){
					label.text('Status: ON');
				}else{
					label.text('Status: OFF');
				}
			}else{
				label.text("Status: init error");
			}
		},
		function(error){
			console.log(error);
			label.text("Status: init error");
		}
	);	
}

//Click handler for the UP button
function bindUpHandler(windowElt,label){
	//BUTTON UP = ON
	windowElt.on('click', 'up', function(e) {
		//Send Ajax request to turn ON the heater
		ajax({ url: urlTurnON, type: 'json' },
			function(data) {			
				//Display confirmation
				label.text("Status: ON");
			},
			function(error) {
				console.log(error);
				label.text("Status: error...");	
			}
		);
	});	
}

//Click handler for the DOWN button
function bindDownHandler(windowElt,label){
	//BUTTON DOWN = OFF
	windowElt.on('click', 'down', function(e) {
		//Send Ajax request to turn OFF the heater
		ajax({ url: urlTurnOFF, type: 'json' },
			function(data) {		
				//Display confirmation
				label.text("Status: OFF");
			},
			function(error) {
				console.log(error);
				label.text("Status: error...");
			}			 
		);
	});	
}
