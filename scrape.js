var q = require('bluebird'),
    request = require('request-promise'),
		cheerio = require('cheerio'),
		fs = require('fs'),
		jsonFile = require('jsonfile'),
    _ = require("lodash");

var parsePages = function(pages) {
  console.log("pages?", pages);

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
        mostCommonAmongSongs = _.filter(sortedTokens, function(o) {
          return o.songs.length > 1; });
    console.log("sortedResults: " , sortedTokens);

    console.log("\n \n Appears in Multiple Songs: ", mostCommonAmongSongs);

        var songsFile = 'app/songs_data.json',
            mostSongsFile = 'app/most_songs_data.json';
            // console.log("regions", regions);

            jsonFile.writeFile(songsFile, sortedTokens, {spaces: 2}, function(err){
              console.error(err);
            });

            jsonFile.writeFile(mostSongsFile, mostCommonAmongSongs, {spaces: 2}, function(err){
              console.error(err);
            });



  });


}

var getPages = function() {
  var options = {
    uri: 'http://lyricstranslate.com/en/nancy-ajram-lyrics.html',
    transform: function(body){
      return cheerio.load(body);
    }
  };

  var getLinks = function($) {
    var links = [];
    $('a').each(function(i, element) {
      if ($(element).text() === 'Transliteration') {
        links.push({url: 'http://lyricstranslate.com/' + $(element).attr('href'), selector: '#content00'});
      }
    });
    return links;
  };

  var pageRequest = request(options)
                      .then(function($) {
                        var pages = getLinks($);
                        parsePages(pages);
                      });

}

getPages();


var tokens = [];

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