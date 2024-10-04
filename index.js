const express = require("express")
const {open} = require("sqlite")
const sqlite3 = require("sqlite3")
const path = require("path")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const cors = require("cors");
const { request } = require("http")
const dbPath = path.join(__dirname , "diagonalasis.db")
let db = null;
const app = express()
app.use(express.json())

app.use(cors());
const initilizeDbAndServe = async () => {
    try{
        db = await open({
            filename : dbPath,
            driver : sqlite3.Database
        })
            app.listen(3005 , () => {
                console.log("This server is running on http://localhost:3005")
            })
    }catch(e){
        console.log(`Error DB :${e.message}`)
        process.exit(1)
    }
    
}
initilizeDbAndServe()



app.post("/signup", async (request, response) => {

  const { username, firstname, lastname, email, phoneNumber, dateOfBirth, password } = request.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM users WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
      const createUserQuery = `
        INSERT INTO users (username, firstname, lastname, password, email, phone_number, date_of_birth) 
        VALUES ('${username}', '${firstname}', '${lastname}', '${hashedPassword}', '${email}', '${phoneNumber}', '${dateOfBirth}')
      `;
      const dbResponse = await db.run(createUserQuery);
      const newUserId = dbResponse.lastID;
      console.log("User created with ID:", newUserId);
      response.send({ success: "User created", userId: newUserId });
  } else {
      console.log("User already exists");
      response.status(400).send("User already exists");
  }
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM users WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      const payload = {
        username: username,
      };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      response.send({ jwt_token : jwtToken });
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
  }
});

app.get("/doctors" , async (request ,response) => {
    const query = `SELECT * FROM doctors`

    const doctorsResults = await db.all(query)
    if (doctorsResults !== undefined){
      response.status(200)
      response.send(doctorsResults)
    }
    else{
      response.status(400)
      response.send({Failure : "Not Data Found"})
    }

})