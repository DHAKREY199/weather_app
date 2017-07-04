var express = require("express");
var app =express();
var request = require("request");
var NodeGeocoder = require('node-geocoder');
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.static("images"));
const fToC = require('f-c');
var options = {
  provider: 'google',
 
  // Optional depending on the providers 
  httpAdapter: 'https', // Default 
  apiKey: 'AIzaSyBKHRSwO5NRBz_m_Z9B9IJhGax9E9eqFOw', // for Mapquest, OpenCage, Google Premier 
  formatter: null         // 'gpx', 'string', ... 
};
var geocoder = NodeGeocoder(options);
var day;
function timeConverter(UNIX_timestamp){
              var a = new Date(UNIX_timestamp * 1000 + 1.98e+7);
              var months = ['Jan','Feb','Mar','Apr','May','Jun','July','Aug','Sep','Oct','Nov','Dec'];
              var year = a.getFullYear();
              var month = months[a.getMonth()];
              var date = a.getDate();
              var hour = a.getHours();
              var min = a.getMinutes();
              var sec = a.getSeconds();
              var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
              if(hour>12){
                time = (hour-12) + ':' + "00"+' PM';
              }
              else
                time = hour + ':' + "00"+' AM';
              
              return time;
}

app.get("/", function(req, res) {
    res.render("search");
});
app.get("/results", function(req, resp){
    var query = req.query.search;
    var latitude ;
    var longitude;
    //console.log(query);
         geocoder.geocode(query)
          .then(function(res) {
            //console.log(res);
            latitude = res[0].latitude;
            longitude = res[0].longitude;
            var url = "https://api.darksky.net/forecast/218682c0e0714e069de1b9c5ab44f6ed/"+latitude+","+longitude;
                    request(url,function(error, response, body){
                 if(!error&&response.statusCode == 200){
                var data = JSON.parse(body);
                //console.log(timeConverter(data.currently.time));
              var obj = {
                    query : query,
                    current_time : {time : timeConverter(data.currently.time), temp : Math.round(fToC(data.currently.temperature))},
                    other_time : [{time : timeConverter(data.hourly.data[0].time),temp : Math.round(fToC(data.hourly.data[0].temperature)), icon : data.hourly.data[0].precipType},
                                  {time : timeConverter(data.hourly.data[1].time),temp : Math.round(fToC(data.hourly.data[1].temperature)), icon : data.hourly.data[1].precipType},
                                  {time : timeConverter(data.hourly.data[5].time),temp : Math.round(fToC(data.hourly.data[5].temperature)), icon : data.hourly.data[5].precipType},
                                  {time : timeConverter(data.hourly.data[7].time),temp : Math.round(fToC(data.hourly.data[7].temperature)), icon : data.hourly.data[7].precipType},
                                  {time : timeConverter(data.hourly.data[9].time),temp : Math.round(fToC(data.hourly.data[9].temperature)), icon : data.hourly.data[9].precipType},
                                  {time : timeConverter(data.hourly.data[10].time),temp : Math.round(fToC(data.hourly.data[10].temperature)), icon : data.hourly.data[10].precipType}],
                                  
              };
                console.log(Math.round(fToC(data.currently.temperature)));
                //console.log(data);
                resp.render("results", {obj : obj});
            }
                
            });
            
            
          })
          .catch(function(err) {
            console.log(err);
          });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("weather app has started!!!");
});