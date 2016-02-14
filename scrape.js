var q = require('bluebird'),
    request = require('request-promise'),
		cheerio = require('cheerio'),
		fs = require('fs'),
		jsonFile = require('jsonfile'),
    _ = require("lodash");
    
var pages = [
             {url: 'http://lyricstranslate.com/en/ah-w-noss-%D8%A2%D9%87-%D9%88-%D9%86%D8%B5.html', selector: '#content00 p'},
             {url: 'http://lyricstranslate.com/en/request/ya-tabtab-wa-dala3-2', selector: '#full-text'}
            ],
    tokens = [];

var newScrapePage = function($, url, selector) {
  console.log("scraping starts");
  var title = $('.title-h2').first().text(), 
      selectedElements = $(selector);

  selectedElements.each(function(i, element) {
    var lyrics = $(element).text(),
        splitLyrics = lyrics.split(" ");

    $(splitLyrics).each(function(i, token) {
      var existingToken = _.find(tokens, function(obj) { return obj.name == token});
      if (existingToken) {
        existingToken["count"]= existingToken["count"] + 1;

        if (existingToken.songs.indexOf(title) === -1){
          existingToken.songs.push(title);
          // console.log("tokens", tokens);
        }

      }
      else {
        tokens.push({name: token, count: 1, songs: [title]});
      }

    });
  });
};

var requests = [];

pages.forEach(function(page) {
  var options = {
    uri: page.url,
    transform: function(body){
      return cheerio.load(body);
    }
  };

  var pageRequest = request(options)
                      .then(function($) {
                        newScrapePage($, page.url, page.selector);
                      });
  requests.push(pageRequest);
});

q.all(requests).then(function(results){
  console.log('all done with ' + results.length + ' queries');

  var sortedTokens = _.sortBy(tokens, function(o) { return o.count; }).reverse(),
      mostCommonAmongSongs = _.filter(tokens, function(o) {
        return o.songs.length > 1; }).reverse();
  // console.log("sortedResults: " , sortedTokens);

  console.log("\n \n Appears in Multiple Songs: ", mostCommonAmongSongs);

      

});




//     //Write file

//     // var regionFile = 'app/region_data2.json',
//     // 		countryFile = 'app/country_data2.json';

//     // 		// console.log("regions", regions);

//     // 		jsonFile.writeFile(regionFile, regions, {spaces: 2}, function(err){
//     // 			console.error(err);
//     // 		});

//     // 		jsonFile.writeFile(countryFile, countries, {spaces: 2}, function(err){
//     // 			console.error(err);
//     // 		});

//   }
// });