var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

// var url = 'http://marine.weather.gov/MapClick.php?zoneid=LSZ162';
var ifttt_key = '';

var score  = 0;
var thresh = 6;
var pWave = 0;
var windDirections = ['North', 'Northeast', 'East'];
var hasSent = fs.readFileSync('./email.txt', 'utf-8'); //store the email sender boolean...

var options = {
  url: 'http://marine.weather.gov/MapClick.php?zoneid=LSZ162',
  headers: {
    'User-Agent': 'request'
  }
};

// //reenable the email boolean checker.
// var now = new Date(); //stupid date thing.
// if (now.getHours() == 23){
// 	//if 11pm then set to false....
// 	fs.writeFileSync('./email.txt','false');
// 	// process.exit(); //kill the script
// }

request(options, function(error, resp, body){

$ = cheerio.load(body);
// console.log(body)

$('.row-forecast .forecast-text', $('#detailed-forecast-body')).each(function(i,element){

	var forecast = $(element).text();

	var parts = forecast.split(" "); //get the direction and windspeed parts
	var direction = parts[0];
	var lowSpeed = parts[2];
	var waves = forecast.match(/\d to \d feet/g);

	// console.log(direction,lowSpeed);

	if( windDirections.indexOf(direction) != -1){
		//its the right direction
		score ++;  //add one point

		if(lowSpeed >= 15){
			score++; // add 2 points
		}
		if( lowSpeed >= 20){
			score ++; //add 3 points
		}

		if(lowSpeed >= 25){
			score ++; //add 4 points
		}

		if( windDirections.indexOf(direction) == 1){
			//if wind is NE add another point
			score ++; // add 2 points
		}

		if(waves){
			for(var i = 0; i < waves.length; i++){
				var waveHeight = waves[i].split(" ")[0];

				//store the highest waveHeight to send in the email
				if(waveHeight > pWave){
					pWave = waveHeight;
				}


				if(waveHeight >= 3){
					score ++; // +1
				}

				if(waveHeight >= 5){
					score ++; // +2
				}

				if(waveHeight >= 7){
					score ++; // +3
				}

				if(waveHeight >= 10){
					score ++; // +4
				}

				if(waveHeight >= 15){
					score = 9999; //high score dude.
				}

			} //
		} //if waves

	}

});

console.log("score: "+score);
// console.log(hasSent);

if (score > thresh){
	// if (hasSent == 'false'){
		//send email using ifttttttttttttt
		console.log("working?");
		request.post('https://maker.ifttt.com/trigger/surf/with/key/' + ifttt_key, {form:{ "value1" :"http://forecast.benmoren.com", "value2" : pWave, "value3" : score }}, function(error, response, body) {
      		console.log('Body response was ', body);
      		console.log('Error was ', error);

      		if(error == null){
      			//if there were no errors, the email sent, set the hasSent to true so we only get 1 email today.
						console.log("email was sent");
      			// fs.writeFile('./email.txt','true');
      		}
   		});
	// }

}else{
	console.log("score is not high enough to take action");
}



})


/*
//Example Forecast

Late This AfternoonNorthwest winds 10 to 20 knots. Waves 1 to 3 feet.
TonightNorthwest winds 10 to 20 knots becoming north 5 to 15 knots after midnight. Waves subsiding to calm to 2 feet.
TuesdayEast winds 5 to 15 knots becoming southeast 10 to 20 knots in the afternoon. Waves calm to 2 feet.
Tuesday NightSoutheast winds 15 to 25 knots veering south after midnight. Waves building to 2 to 4 feet.
WednesdaySouth winds 10 to 20 knots veering southwest in the afternoon. A slight chance of snow in the morning. A chance of rain. Waves subsiding to calm to 2 feet.
Wednesday NightNorthwest winds 10 to 20 knots becoming north 15 to 25 knots after midnight. A chance of rain...possibly mixed with snow. Waves calm to 2 feet.
ThursdayNorth winds 15 to 25 knots diminishing to 10 to 20 knots in the afternoon. Waves building to 1 to 3 feet...then subsiding to calm to 2 feet.
Thursday NightNorth winds 10 to 20 knots increasing to 15 to 25 knots after midnight. Waves building to 1 to 3 feet.
FridayNorth winds 10 to 20 knots backing west. Waves subsiding to calm to 2 feet.
SaturdayWest winds 15 to 25 knots diminishing to 10 to 20 knots. Waves building to 3 to 5 feet...then subsiding to 1 to 3 feet.


 */
