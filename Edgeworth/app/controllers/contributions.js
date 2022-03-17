"use strict";
const Contribution = require("../models/contribution");
const User = require("../models/user");
const Candidate = require("../models/candidate");
var sanitizeHtml = require('sanitize-html'); //Added sanitizeHtml to sanitize user input
const { logger } = require("handlebars");
const Joi = require("@hapi/joi");
const Boom = require("@hapi/boom");
var likes = 0;
//var imageUrl = "No image"
//var weathers = "Not working";
const jsdom = require('jsdom');
const dom = new jsdom.JSDOM("");
const jquery = require('jquery')(dom.window);
var axios = require('axios');
var Filter = require('bad-words'),
    filter = new Filter();



const { Configuration, OpenAIApi } = require("openai");


const request = require('request');

const Contributions = {

  home: {
    handler: async function (request, h) {
      const contributions = await Contribution.find().lean();
      return h.view("home", { title: "Library" });
    },
  },
  report: {
    handler: async function (request, h) {
      const contributions = await Contribution.find().populate("contributor").lean();
      return h.view("report", {
        title: "Contributions",
        contributions: contributions,
      });
    },
  },
  contribute: {
    handler: async function (request, h) {
      try {
        const id = request.auth.credentials.id;
        const user = await User.findById(id);
        const data = request.payload;

        var currentWeather = "I can't see";
        var prompt = "Hmmm, try scribbling another story."
        var completion = "Hmmm, our story engine has broken down. Try again."
        var story = "Hmmm, we haven't stuck your story together yet. Try again";
        var imageUrlReturn = "https://images.unsplash.com/photo-1586410074293-91d01ca0db5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyOTQxMjB8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NDMzOTAxODc&ixlib=rb-1.2.1&q=80&w=400";


        // Get current weather from OpenWeatherAPI to populate story stem paragraph
        const weatherRequest = `http://api.openweathermap.org/data/2.5/weather?q=`+data.country+`&appid=${process.env.WEATHER_API_KEY}`;
        async function getWeather() {
          let weather = {};
          const response = await axios.get(weatherRequest);
          if (response.status == 200) {
            weather = response.data
            //currentWeather = JSON.stringify(weather.weather[0].description)[0].toUpperCase();
            currentWeather = weather.weather[0].main;
          }
          console.log(weather);
          console.log(currentWeather);
          //console.log(weather.weather[0].description)
          //return currentWeather;
        }


        // Get image based on user inputted teddy type from Unsplash to be added to html

        async function getImage() {
          //var imageUrl = "https://images.unsplash.com/photo-1570458436416-b8fcccfe883f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyOTQxMjB8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NDMzOTEzOTk&ixlib=rb-1.2.1&q=80&w=400";

          var config = {
            method: 'get',
            url: `https://api.unsplash.com/photos/random?client_id=${process.env.IMAGE_API_KEY}&query=` + data.teddyType,
            headers: {
            }
          };

          await axios(config)

            .then(function (response) {
              console.log(JSON.stringify(response.data.urls.regular));
              console.log("Response type:" + response.type);
              imageUrlReturn = response.data.urls.regular;
              console.log(imageUrlReturn);
              // console.log("response.urls.regular:" + JSON.stringify(response.urls.regular));
              console.log("")

              //var imageUrl = JSON.stringify(response.data.urls.regular);
              // var imageUrlReg = String(imageUrl.urls.regular);
              // response.urls.regular
            })
            .catch(function (error) {
              console.log(error);
            });


          return imageUrlReturn;

        }



        //Story stem paragraph populated with user inputted data and weather api data
        async function populateStemParagraph() {

          prompt = `

          Once upon a time, ` + data.age + `-year-old ` + data.name + ` and ` + data.teddyName + ` ` + data.teddyType + ` were
                supposed to be asleep in their home in ` + data.country + `. 
                \n"Psst! Are you awake?" ` + data.name + ` asked ` + data.teddyName + `.
                \n"No", ` + data.teddyName + ` groaned.
                \n"Let's have an adventure!" ` + data.name + ` cried.
                \n"No, we'll get in trouble".
                \n"What if we go on a ` + data.genre + ` adventure to find ` + data.food + `"? ` + data.teddyName + ` loved ` + data.food + `.
                \n` + data.teddyName + `'s ears twitched. "I'm listening".
                \n"What is the weather like", ` + data.teddyName + `? asked ` + data.name + `. 
                \n"` + currentWeather + `", ` + data.teddyName + ` said, peering out the window.
                \n"Perfect!" said ` + data.name + ` "Let's go!"`
          
          prompt = filter.clean(prompt);
          console.log(prompt);

        };

//Set zaniness level of story by adjusting text generation temperature which controls likelihood of next words (increases mean completions are less expected)
//Should integate into promise chain
          var temperature = 0.7;
          function chooseZaniness() {
          if (data.zaniness == "boring") {
            temperature = 0.55;
          }
          else if (data.zaniess == "normal") {
            temperature = 0.7;
          }
          else {
            temperature = 0.85;
          }
        };
        

        chooseZaniness();


        // Send user and api populated prompt to text generation engine of OpenAI to complete stories

        async function getGpt3() {
          const configuration = new Configuration({
           // apiKey: `${process.env.OPEN_API_KEY}`,
            apiKey: `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`,

          });
          const openai = new OpenAIApi(configuration);

          try {
            const response = await openai.createCompletion("text-davinci-001", {
              prompt: data.title + 'n\ ' + prompt,
              temperature: temperature,
              max_tokens: 500,
              top_p: 1,
              frequency_penalty: 0,
              presence_penalty: 0,
            });
            completion = response.data.choices[0].text; //`${prompt}${response.choices[0].text}`;
            story = prompt + '\n ' + completion;
            console.log(response);
            console.log(completion);
            console.log(story);
          } catch (err) {
            console.log(err);
          }

        }

//Async chain to order and handle promises from weather, image, stem, completion, and database
        // async function produceStory() {
        const weatherAwait = await getWeather(user);
        console.log(currentWeather);
        const imageAwait = await getImage(weatherAwait);
        console.log(imageUrlReturn);
        const stemAwait = await populateStemParagraph(imageAwait);
        console.log(prompt);
        const gpt3Await = await getGpt3(stemAwait);
        console.log(story);

        //Create contribution made up of story and story elements to be sent to MongoDB
        const newContribution = new Contribution({
          title: sanitizeHtml(data.title),
          name: sanitizeHtml(data.name),                // sanitize user input
          age: sanitizeHtml(data.age),        // sanitize user input
          teddyName: sanitizeHtml(data.teddyName),
          teddyType: sanitizeHtml(data.teddyType),
          food: sanitizeHtml(data.food),
          country: sanitizeHtml(data.country),  // sanitize user input
          genre: sanitizeHtml(data.genre),
          likes: likes,   //added like for like button
          weather: currentWeather, 
          image: imageUrlReturn,       
          story: story,

          contributor: user._id,
        });


        await newContribution.save(gpt3Await);
        console.log('All work done');
        return h.redirect("/report");
      } catch (err) {
        return h.view("main", { errors: [{ message: err.message }] });
      }
    },
  },
  // Delete method added
  deleteContribution: {
    auth: false,
    handler: async function (request, h) {
      const contribution = Contribution.findById(request.params._id);
      console.log("Removing contribution: " + contribution);
      await contribution.deleteOne();
      return h.redirect("/report");
    }
  },

  // Show method needed to add contribution values to edit page
  showContribution: {
    handler: async function (request, h) {
      try {
        const contribution = await Contribution.findById(request.params._id).lean();
        return h.view("edit-contribution", { title: "Edit Contribution", contribution: contribution });
      } catch (err) {
        return h.view("edit-contribution", { errors: [{ message: err.message }] });
      }
    },
  },

  // update contribution built with settings update and ICT1 update, but not working
  updateContribution: {
    validate: {
      payload: {
        name: Joi.string().required(),
        type: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
      },
      options: {
        abortEarly: false,
      },
      failAction: function (request, h, error) {
        return h.view("update-contribution", {
          title: "Sign up error",
          errors: error.details,
        })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      try {
        const contributionEdit = request.payload;
        console.log(contributionEdit);
        const id = request.params._id;
        console.log("ID: " + id);
        const contribution = await Contribution.findById(id);
        console.log("Contribution:" + contribution);
        contribution.name = contributionEdit.name;
        console.log("Contributiion Edit:" + contributionEdit.name)
        contribution.type = contributionEdit.type;
        contribution.description = contributionEdit.description;
        contribution.location = contributionEdit.location;
        await contribution.save();
        return h.view("report", { contribution });
      } catch (err) {
        return h.view("report", { errors: [{ message: err.message }] });

      }
    }
  },

  // Like contribution method that adds 1 to star counter every time button is clicked
  likeContribution: {
    auth: false,
    handler: async function (request, h) {
      const contribution = await Contribution.findById(request.params._id);
      console.log(contribution.likes)
      contribution.likes++;
      console.log("Contribution " + contribution._id + " has " + contribution.likes + " likes");

      await contribution.save();
      return h.redirect("/report", {
        contribution: likes,
      });
    }
  },


};

module.exports = Contributions;


