/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

//Requires
var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');

//Conf
var host = "home.kovaxlabs.com";
var port = "8083";
var deviceNumber = 2;

var urlBase = "http://" + host + ":" + port + "/ZWaveAPI/Run/devices[" + deviceNumber +"].instances[0]";
var urlTurnON = urlBase + ".SwitchBinary.Set(255)";
var urlTurnOFF = urlBase + ".SwitchBinary.Set(0)";
var urlGetStatus = urlBase + ".commandClasses[37].Get()";

//Main
var main = new UI.Card({
  title: 'Home suite 1.0',
  icon: 'images/menu_icon.png',
  subtitle: 'Heating control',
  body: 'Press UP to turn the heater on, DOWN to turn the heater off and SELECT for status'
});

main.show();

/////////////////
//Events
var card = new UI.Card();
card.title('Heating system');
card.subtitle('Confirmation');

//BUTTON UP = ON
main.on('click', 'up', function(e) {
	//Send Ajax request to turn ON the heater
	ajax({ url: urlTurnON, type: 'json' },
		function(data) {			
				//Display confirmation
				card.body('Ajax request ON was sent...');
				card.show();
		},
		function(error) {
				console.log(error);
				card.body('There was an error...');
				card.show();			
		}
	);
});


//BUTTON DOWN = OFF
main.on('click', 'down', function(e) {
	//Send Ajax request to turn OFF the heater
	ajax({ url: urlTurnOFF, type: 'json' },
		function(data) {		
				//Display confirmation
				card.body('Ajax request OFF was sent...');
				card.show();
		},
		function(error) {
				console.log(error);
				card.body('There was an error...');
				card.show();			
		}			 
	);
});

//BUTTON SELECT = STATUS
main.on('click', 'select', function(e) {
	//Get the status (todo)
	var status = "ON";
	
	//Display the status
  var wind = new UI.Window();
  var textfield = new UI.Text({
    position: new Vector2(0, 50),
    size: new Vector2(144, 30),
    font: 'gothic-24-bold',
		text: 'Status: ' + status,
    textAlign: 'center'
  });
  wind.add(textfield);
  wind.show();
});
