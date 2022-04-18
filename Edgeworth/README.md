![logo](public/images/fibber-logo.png)

# Welcome to Fibber, the children's story making app
Do your children want a new story every night before bed? Now you can help them create their own with Fibber, the story-making app. They add the details—hero/ines, stuffed animal sidekick, location, favourite food, story type—and Fibber does the rest. Using live data, API calls, and Natural Language Processing (NLP) tools, Fibber makes completely unique stories for your children every time, and allows them return again and again to old favourites. Watch vocabularies grow and imaginations soar with Fibber.

![ink-dots](https://user-images.githubusercontent.com/59654922/163886008-19b379bb-df6e-4c24-80f0-9ea6bf19c291.png)


## Links
- [Fibber](https://fibbergenerator.herokuapp.com/)
- [Fibber Project Landing Page](https://dananthonyobrien.github.io/fibber/)
- [Trello](https://trello.com/b/HTelfKok/final-year-project)


## Tools
Fibber is built using Node.js; persistance comes from MongoDB. It is hosted on Heroku and all source files can be accessed on GitHub. APIs are called from:
- [OpenAI](https://openai.com/api/)
- [AI21 Labs](https://www.ai21.com/)
- [OpenWeatherMap](https://openweathermap.org/)
- [Unsplash](https://unsplash.com/)

## Getting Started
### Initialising node.js
To initialize node.js project, follow these steps:
1. Open project in Visual Studio Code or other editor.
2. To launch node.js file, in the command line navigate to folder the index.js file is in and enter:
`node index.js`
2. Code now running at http://localhost:3000 (local host address may be different, check output in command line).
**Note:** Changes to HTML can be seen by saving Visual Studio and refreshing browers. However, for changes to JavaScript, you must CTRL+C out node.js at the command line, and then reinitialise by re-entering:
`node index.js`

### Launching mongodb database
To launch MongoDB database, follow these steps:
1. Typically, to launch the mongodb database service on your platform, first create a directory somewhere to store the database itself:
`mkdir db`
2.	Enter:
`mongod -dbpath db`
3.	Launch Robo 3T, File > Connect
4.	For new connections, click Create
**Note:** Make sure Mongoose in installed:
`npm i mongoose` 

### Push files to GitHub with Git
To host files on GitHub using Git, complete the following steps:
1. Initialise project with Git:
`git init`
2. Add new files:
`git add .`
3. Commit files, adding message:
`git commit -m "new security feature added"`
4. **Optional:** Add new branch (here named develop):
`git branch develop`
5. **Optional:** Switch between branches:
`git checkout master`
6. **Optional:** To merge branches checkout branch you wish to merge to (ie develop):
`git merge feature-security`
**Note:** Best practise to use tagged release, main, development, and new feature branches workflow
7. Created new repository on GitHub and get url. Link local and remote:
`git remote add origin https://github.com/Edgeworth-POI-Project.git`
8. Push from local to remote:
`git push origin develop`


9. To tag your branch at a particular point:
`git tag -a v1.5 -m "Version 1.5 with new security feature"`

![fibber-owl-eyes-up](https://user-images.githubusercontent.com/59654922/163885952-06db6705-f5c1-463b-b314-300a0a5d7b5f.png)

