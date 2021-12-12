/*
todo list

You should provide your own project, not the example URL.

You can POST to /api/users with form data username to create a new user.

The returned response from POST /api/users with form data username will be an object with username and _id properties.

You can make a GET request to /api/users to get a list of all users.

The GET request to /api/users returns an array.

Each element in the array returned from GET /api/users is an object literal containing a user's username and _id.

You can POST to /api/users/:_id/exercises with form data description, duration, and optionally date. If no date is supplied, the current date will be used.

The response returned from POST /api/users/:_id/exercises will be the user object with the exercise fields added.

You can make a GET request to /api/users/:_id/logs to retrieve a full exercise log of any user.

A request to a user's log GET /api/users/:_id/logs returns a user object with a count property representing the number of exercises that belong to that user.

A GET request to /api/users/:id/logs will return the user object with a log array of all the exercises added.

Each item in the log array that is returned from GET /api/users/:id/logs is an object that should have a description, duration, and date properties.

The description property of any object in the log array that is returned from GET /api/users/:id/logs should be a string.

The duration property of any object in the log array that is returned from GET /api/users/:id/logs should be a number.

The date property of any object in the log array that is returned from GET /api/users/:id/logs should be a string.. Use the dateString format of the Date API.

You can add from, to and limit parameters to a GET /api/users/:_id/logs request to retrieve part of the log of any user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back.

exercise
{
  username: "fcc_test"
  description: "test",
  duration: 60,
  date: "Mon Jan 01 1990",
  _id: "5fb5853f734231456ccb3b05"
}

user
{
  username: "fcc_test",
  _id: "5fb5853f734231456ccb3b05"
}

log
{
  username: "fcc_test",
  count: 1,
  _id: "5fb5853f734231456ccb3b05",
  log: [{
    description: "test",
    duration: 60,
    date: "Mon Jan 01 1990",
  }]
}



*/
//IMPORT
const express = require('express')
const app = express()
const cors = require('cors')

const bodyParser = require('body-parser');
const axios = require('axios');

require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));



let filterExerciseOutput= async ({start,finish,limit},output) => {
  let filteredDates =output;

if (start){
  filteredDates = await filteredDates.filter(item=> Date.parse(item.date) > start)
}

  if (finish){
  filteredDates = await filteredDates.filter(item=> Date.parse(item.date) < finish)
  }

  if (limit){
    filteredDates = filteredDates.slice(0,limit)
  }  

  return filteredDates;

 }



// GET middlewares
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get("/api/users", async function(req,res){
let userList = await axios.get("https://extracker-d19f9-default-rtdb.firebaseio.com/users.json")
let userElements = await Object.values(userList.data)

let test= await Object.keys(userList.data)
console.log(test)

let output = await userElements.map(data => {

return {"username": data.username, "_id": data._id }

})


let finalOutput= await res.json(Object.values(output))

}

)

app.get("/api/users/:_id/logs", async function(req,res){
  let _id= req.params._id
 
  let exerciseList = await axios.get(`https://extracker-d19f9-default-rtdb.firebaseio.com/users/${_id}/exercises.json`).then(response => response.data).then(response=> Object.values(response))

  

  let exerciseCount = await exerciseList.length

  let test = await console.log(exerciseList , exerciseCount )

  let exerciseOutput = await exerciseList.map(item =>{ return {"description" : item.description, "date": item.date, "duration" : parseInt(item.duration)} })
  let username = await exerciseList.map(item=> item.username)

  console.log(req.query)
  
  if(req.query == {}){

    let nonFilteredOutput = await res.json({"_id" : _id, "username":username[0],"count": exerciseCount, "log":exerciseOutput})
  
  }else{

  let startTime =  Date.parse(req.query.from)
  let finishTime = Date.parse(req.query.to)
  
  let limitCount = parseInt(req.query.limit)

  let formattedQueryParameters = {"start": startTime, "finish": finishTime, "limit": limitCount} 


 let filteredLog = await filterExerciseOutput(formattedQueryParameters,exerciseOutput)
  
  //let filteredDates = await exerciseOutput.filter(item=> Date.parse(item.date) > startTime && Date.parse(item.date) < finishTime)
    

  let sendOutput = await res.json({"_id" : _id, "username":username[0],"count": exerciseCount, "log": filteredLog })
  }

 
  
}
  
  
)

  






//POST middleware for new user registration


app.post("/api/users", async function(req,res){
let username = req.body.username
 
  let firstPost = await axios.post("https://extracker-d19f9-default-rtdb.firebaseio.com/users.json", {"username": username})

  let userList = await axios.get("https://extracker-d19f9-default-rtdb.firebaseio.com/users.json")
  let userElements = await Object.values(userList.data)

  let userIds= await Object.keys(userList.data)

  let out = await userIds[userIds.length-1]

  let finalPatch = await axios.put(`https://extracker-d19f9-default-rtdb.firebaseio.com/users/${out}.json`, {"username": username, "_id": out})

  let output = await res.json({"username":username,"_id": out})

});
  
  
//POST middleware2 

 app.post("/api/users/:_id/exercises", async function(req,res){
let _id= req.params._id;
let description = req.body.description;
let duration = req.body.duration;
let date = req.body.date;

if(!date){
  let today = new Date()
  date= today.toDateString()
}else{
  let givenDate = new Date(date)
  date = givenDate.toDateString();
}

let findUser= await axios.get(`https://extracker-d19f9-default-rtdb.firebaseio.com/users.json`)
.then(response => Object.values(response.data))

let filterUser= await findUser.filter(data => data["_id"]== _id)

let foundUsername = filterUser[0].username
let exercisePostBody= await {"_id":_id,"username":foundUsername, description,"duration" : parseInt(duration),date}
console.log(exercisePostBody)

let exercisePost = await axios.post(`https://extracker-d19f9-default-rtdb.firebaseio.com/users/${_id}/exercises.json`,exercisePostBody)

let exerciseOutput = Object.values(exercisePostBody)

let sendResult = res.json({"_id":_id,"username":foundUsername, description,"duration": parseInt(duration),date})


 })



//POST middleware3



const listener = app.listen(process.env.PORT || 8000 , () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

