const express = require("express")
const app = express()
const path = require("path")
// paste in rollbar code block here
// include and initialize the rollbar library with your access token
var Rollbar = require("rollbar")
var rollbar = new Rollbar({
    accessToken: "ae38c434d2514740b645b1bd3542517a",
    captureUncaught: true,
    captureUnhandledRejections: true
})

// record a generic message and send it to Rollbar
rollbar.log("Hello world!")

app.use(express.json())

const students = ["Jimmy", "Timothy", "Jimothy"]

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/index.html"))
})

app.get("/api/students", (req, res) => {
    rollbar.info("Someone got the student list")
    res.status(200).send(students)
})

app.post("/api/students", (req, res) => {
    let { name } = req.body

    const index = students.findIndex(student => {
        return student === name
    })

    try {
        if (index === -1 && name !== "") {
            students.push(name)
            res.status(200).send(students)
        } else if (name === "") {
            rollbar.warning("Someone tried to add an empty string.")
            res.status(400).send("You must enter a name.")
        } else {
            // rollbar.error('Someone tried to duplicate a student')
            res.status(400).send("That student already exists.")
        }
    } catch (err) {
        rollbar.critical('Something went wrong in the student list post request')
        console.log(err)
    }
})

app.delete("/api/students/:index", (req, res) => {
    const targetIndex = +req.params.index

    students.splice(targetIndex, 1)
    rollbar.info('Somone deleted a student!')
    res.status(200).send(students)
})

const port = process.env.PORT || 5050

app.listen(port, () => console.log(`Server listening on ${port}`))
