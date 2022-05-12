const mongoose = require("mongoose")
const dotenv = require("dotenv")

process.on("uncaughtException", err => {
  console.log(err.name, err.message)
  console.log("UNCAUGHT EXCEPTION! ERROR..")
  process.exit(1) // 1 -- uncaught exception  and 0 -- success
})

/**
 * To read all environment variables
 */
dotenv.config()

/**
 * Import app
 */
const app = require("./app")

/**
 * Database connection
 */
const DB = process.env.DATABASE
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Database successfully connected...")
  })

/**
 * Listening to server
 */
const PORT = process.env.PORT || 4444
const server = app.listen(PORT, () => {
  console.log(`App running on PORT ${PORT}........`)
})

process.on("unhandledRejection", err => {
  console.log(err.name, err.message)
  console.log("UNHANDLED REJECTION! ERROR..")
  server.close(() => {
    process.exit(1)
  })
})

/**
 * SIGTERM SIGNAL HANDLER
 * This is basically for HEROKU
 */
process.on("SIGTERM", () => {
  console.log("SIGTERM RECEIVED! Shutting down......")

  server.close(() => {
    console.log("Process terminated.......")
  })
})
