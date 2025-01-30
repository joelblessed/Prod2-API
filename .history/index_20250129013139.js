express = require("")
const app = require("express")()

const PORT = 8080;
app.listen(
    PORT,
    () => console.log(`it's live on http://localhost:${PORT}`)
)