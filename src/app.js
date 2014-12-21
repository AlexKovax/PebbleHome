/**
 * Pebble Home project
 *
 * A simple app to make call to a z-way url
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

///////////////////
// Get status and display main screen

//Display the status
var wind = new UI.Window();

//Title part
var title = new UI.Text({
	position: new Vector2(10, 40),
	size: new Vector2(124, 30),
	font: 'gothic-24-bold',
	text: 'Pebble Home',
	textAlign: 'left'
});
wind.add(title);

//Status part
var status = new UI.Text({
	position: new Vector2(10, 70),
	size: new Vector2(124, 30),
	font: 'gothic-18-bold',
	text: 'Status: loading...',
	textAlign: 'left'
});
wind.add(status);

var onLabel = new UI.Text({
	position: new Vector2(90, 10),
	size: new Vector2(40, 20),
	font: 'gothic-24-bold',
	text: 'ON >',
	textAlign: 'right'
});
wind.add(onLabel);

var offLabel = new UI.Text({
	position: new Vector2(80, 114),
	size: new Vector2(50, 20),
	font: 'gothic-24-bold',
	text: 'OFF >',
	textAlign: 'right'
});
wind.add(offLabel);

wind.show();

bindUpHandler(wind,status);
bindDownHandler(wind,status);


/////////////
//Functions

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
