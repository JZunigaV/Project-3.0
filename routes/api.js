const express = require("express");
const router = express.Router();
require("dotenv").config();
const tmdb = require("tmdbv3").init("3c5bc5cac4d9c2e29d68ab73c21b1cfb");

// Global Variables
let str = [];
let textTweet = "";
let languageArray = [];
let lang = "";

//Twitter configuration
const twitter = require("twitter");
const twitterObj = new twitter({
  consumer_key: "Lim6uMrcPkBALUQgRBD1V3rfV",
  consumer_secret: "ebSngBktNp1tadIhtXXeB9iAGTHhfXIel6rT6mWakX621FInGS",
  access_token_key: "980755858563805185-IEDUsSkoU0yaVeLLD0TkffvaQfWo9ag",
  access_token_secret: "ONJDiyRhDsMCCBMK93ErGimK5BICKpXzM8VR4EEF4JtTk"
});

//Personality insigths configuration
const PersonalityInsightsV3 = require("watson-developer-cloud/personality-insights/v3");
const personalityInsights = new PersonalityInsightsV3({
  version_date: process.env.VERSION_DATE,
  iam_apikey: process.env.IAM_API_KEY,
  url: process.env.URL
});

/* GET home page */
router.get("/", (req, res, next) => {
  res.json({
    msg: "itworks"
  });
});

// @route   POST /api/personality/:twitterUsername
// @desc    Make a request to the personality insights api using the twitter userName and return the analysis
// @access  Private
router.post("/personality", (req, res, next) => {
  const userName = {
    screen_name: req.body.username,
    count: 200
  };

  //Get the tweets by user:
  twitterObj
    .get("statuses/user_timeline", userName)
    .then(stageOne => {
      let tweets = "";

      for (let i = 0; i < stageOne.length; i++) {
        tweets += stageOne[i].text;
        languageArray.push(stageOne[i].lang);
      }

      //GEt the most tweeted language
      let tweetLang = languageArray
        .sort(
          (a, b) =>
            languageArray.filter(v => v === a).length -
            languageArray.filter(v => v === b).length
        )
        .pop();
      if (tweetLang !== "" && !undefined) {
        lang = tweetLang;
      } else {
        lang = "en";
      }
      console.log(lang);
      textTweet = tweets;
      return (textTweet = tweets);
    })
    .catch(err => {
      console.log(err);
    })

    //Watson Request
    .then(stageTwo => {
      let paramsWatson = {
        // Get the content items from the JSON file.
        text: stageTwo,
        consumption_preferences: true,
        raw_scores: true,
        headers: {
          "accept-language": "eng",
          "Content-Language": lang,
          accept: "application/json"
        }
      };
      return paramsWatson;
    })
    .then(stageThree => {
      personalityInsights.profile(stageThree, (error, response) => {
        if (error) {
          res.json({ error: error });
        } else {
          res.json(response);
        }
      });
    })
    .catch(err => {
      console.log(err);
    });
});

// @route   POST /api/recommendedGenres
//@Params   username: Twitter username
// @desc    Make a request to the personality insights api using the twitter userName and return the recommended movie genres
// @access  Private
router.post("/recommendedMovies", (req, res, next) => {
  const userName = {
    screen_name: req.body.username,
    count: 200
  };

  // //Get the tweets by user:
  twitterObj
    .get("statuses/user_timeline", userName)
    .then(stageOne => {
      let tweets = "";
      for (let i = 0; i < stageOne.length; i++) {
        tweets += stageOne[i].text;
        languageArray.push(stageOne[i].lang);
      }
      //GEt the most tweeted language
      let tweetLang = languageArray
        .sort(
          (a, b) =>
            languageArray.filter(v => v === a).length -
            languageArray.filter(v => v === b).length
        )
        .pop();
      if (tweetLang !== "" && !undefined) {
        lang = tweetLang;
      } else {
        lang = "en";
      }
      console.log(lang);
      textTweet = tweets;
      return (textTweet = tweets);
    })
    .catch(err => {
      console.log(err);
    })

    //Watson Request
    .then(stageTwo => {
      let paramsWatson = {
        // Get the content items from the JSON file.
        text: stageTwo,
        consumption_preferences: true,
        raw_scores: true,
        headers: {
          "accept-language": "eng",
          "Content-Language": lang,
          accept: "application/json"
        }
      };
      return paramsWatson;
    })
    .then(stageThree => {
      personalityInsights.profile(stageThree, (error, response) => {
        if (error) {
          res.json({ error: error });
          return;
        } else {
          let recommendedMovies = [];

          let moviesResult =
            response.consumption_preferences[4].consumption_preferences;

          //Aqui tendriamos que hacer el calculo para sacar las peliculas que pueden gustarle a la persona debemos ver si podemos hacer la red Neuronal

          let likedGenres = moviesResult.filter(movie => movie.score === 1);

          for (let i = 0; i < likedGenres.length; i++) {
            switch (likedGenres[i].consumption_preference_id) {
              case "consumption_preferences_movie_romance":
                recommendedMovies.push({ name: "romance", id: 998 });
                break;

              case "consumption_preferences_movie_adventure":
                recommendedMovies.push({ name: "adventure", id: 998 });
                break;
              case "consumption_preferences_movie_horror":
                recommendedMovies.push({ name: "horror", id: 998 });
                break;
              case "consumption_preferences_movie_musical":
                recommendedMovies.push({ name: "musical", id: 998 });
                break;
              case "consumption_preferences_movie_historical":
                recommendedMovies.push({ name: "historical", id: 998 });
                break;
              case "consumption_preferences_movie_science_fiction":
                recommendedMovies.push({ name: "scienceFiction", id: 998 });
                break;
              case "consumption_preferences_movie_war":
                recommendedMovies.push({ name: "war", id: 998 });
                break;
              case "consumption_preferences_movie_drama":
                recommendedMovies.push({ name: "drama", id: 998 });
                break;
              case "consumption_preferences_movie_action":
                recommendedMovies.push({ name: "action", id: 998 });
                break;
              case "consumption_preferences_movie_documentary":
                recommendedMovies.push({ name: "documnetary", id: 998 });
                break;

              default:
                break;
            }
          }

          let randomNumber = Math.floor(Math.random() * 1000) + 1;
          tmdb.genre.list((err, categories) => console.log(categories));
          tmdb.genre.movies("", randomNumber, (err, response) => {
            if (!err) {
              //Do something not error
            } else {
              //Do something with the error
            }
          });
          res.json(response.consumption_preferences[4].consumption_preferences);
        }
      });
    })
    .catch(err => {
      console.log(err);
    });
});

router.get("/tweets", (req, res) => {
  // https://dev.twitter.com/rest/reference/get/statuses/user_timeline
  twitterObj.get(
    "statuses/user_timeline",
    { screen_name: "PostMalone", count: 20 },
    function(error, tweets, response) {
      if (!error) {
        res.status(200).json({ title: "Express", tweets: tweets });
      } else {
        res.status(500).json({ error: error });
      }
    }
  );
});

router.get("/movies/:genreId/page/:page", (req, res) => {
  const genreId = req.params.genreId;

  tmdb.genre.list((err, response) => console.log(response));
  tmdb.genre.movies(genreId, 4, (err, response) => {
    if (!err) {
      res.json(response);
    } else {
      res.json(err);
    }
  });
});

router.get("/version", (req, res, next) => {
  res.json({
    TwitterVersion: twitterObj.VERSION,
    IbmVersion: personalityInsights.serviceVersion
  });
});

module.exports = router;
