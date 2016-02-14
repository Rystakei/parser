var request = require('request'),
		cheerio = require('cheerio'),
		fs = require('fs'),
		jsonFile = require('jsonfile'),
    _ = require("lodash"),
    $ = require('jquery');

var url = 'http://lyricstranslate.com/en/ah-w-noss-%D8%A2%D9%87-%D9%88-%D9%86%D8%B5.html',
    tokens = [];



var pages = [
             {url: 'http://lyricstranslate.com/en/ah-w-noss-%D8%A2%D9%87-%D9%88-%D9%86%D8%B5.html', selector: '#content00 p'},
             {url: 'http://lyricstranslate.com/en/request/ya-tabtab-wa-dala3-2', selector: '#full-text'}
            ];



var scrapePage = function(url, selector) {
  request(url, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      

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

      var sortedTokens = _.sortBy(tokens, function(o) { return o.count; }).reverse(),
          mostCommonAmongSongs = _.filter(tokens, function(o) {
            return o.songs.length > 1; }).reverse();
      // console.log("sortedResults: " , sortedTokens);

      console.log("\n \n Appears in Multiple Songs: ", mostCommonAmongSongs);

          
        });
      });


    }
  });

}

pages.forEach(function(page) {
  scrapePage(page.url, page.selector);
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