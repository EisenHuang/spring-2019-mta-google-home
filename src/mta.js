const generalTransitFeed = require("gtfs-realtime-bindings-transit");
const request = require("request");

/**
 * As of right now, only supports 1,2,3,4,5,6,GS,5x,6x
 * Returns times in UNIX time
 * @param {string} trainType
 * @returns {array} timeArray -- returns array with an array of JSON objects. JSON objects contain time in UNIX timestamp
 * @author Daniel Yoo (github: DanielY-Yoo)
 */

const KEY = "c5881ea19e9d80654a41b10353585ef0";

const dataFeeds = {
  "1": `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=1`,
  "2": `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=1`,
  "3": `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=1`,
  "4": `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=1`,
  "5": `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=1`,
  "6": `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=1`,
  S: `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=1`,
  A: `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=26`,
  C: `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=26`,
  E: `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=26`,
  H: `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=26`,
  S: `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=26`,
  N: `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=16`,
  Q: `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=16`,
  R: `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=16`,
  W: `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=16`,
  B: `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=21`,
  D: `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=21`,
  F: `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=21`,
  M: `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=21`,
  L: `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=2`,
  G: `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=31`,
  J: `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=36`,
  Z: `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=36`,
  "7": `http://datamine.mta.info/mta_esi.php?key=${KEY}&feed_id=51`
};

var trainType = process.argv[2];
var num = process.argv[3];
var station = process.argv[4];

/**
 * Gets the next arrival time list of a certain line for the next specified
 * number of trains. Gives back indeterminate length of array if amount is not
 * specified.
 * @param {string} trainType
 * @param {number} amount
 * @returns {array} of objects with the next {amount}, {trainType} trains
 */
function getArrivalTimeList(trainType, amount, stationId) {
  const requestSettings = {
    method: "GET",
    url: dataFeeds[trainType],
    encoding: null
  };

  return new Promise((resolve, reject) => {
    request(requestSettings, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        const result = [];

        const feed = generalTransitFeed.transit_realtime.FeedMessage.decode(
          body
        );
        feed.entity.forEach(function(entity, index) {
            if (entity.tripUpdate) {
                const routeID = entity.tripUpdate.trip.routeId;
                if (routeID == trainType) {
                    if(entity.tripUpdate.stopTimeUpdate){
                      entity.tripUpdate.stopTimeUpdate.forEach(function(update, index) {
                        console.log(update.stopId);
                        if(update.stopId == stationId){
                          result.push(update);
                        }
                      });
                    }
                }
            }
        });
        const resultKeys = Object.keys(result);
        const resultValues = Object.values(result);
        const timeArray = [];

        for (let i = 0; i < resultKeys.length; i += 1) {
          const resultValueKeys = Object.keys(resultValues[i]);
          const resultValueValues = Object.values(resultValues[i]);

          for (let j = 0; j < resultValueKeys.length; j += 1) {
            if (amount < 1) {
              break;
            }
            if (resultValueValues[j].time) {
              var date = new Date(resultValueValues[j].time*1000);
              // Hours part from the timestamp
              var hours = date.getHours();
              // Minutes part from the timestamp
              var minutes = "0" + date.getMinutes();
              // Seconds part from the timestamp
              var seconds = "0" + date.getSeconds();

              // Will display time in 10:30:23 format
              var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
              timeArray.push(formattedTime);
              amount--;
            }
          }
        }
        resolve(timeArray);
      } else {
        reject(new Error(error));
        console.log("ERROR");
      }
    });
  });
}

//STOP 602S
console.log(`TRAIN ${trainType}, NEXT ${num} TRAINS, STOP ${station}: `);
getArrivalTimeList(trainType, num, station).then(timeArray => {
  // TODO: Let the user know what kind of trains are available
  console.log(timeArray);
});
