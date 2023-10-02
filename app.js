const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, "cricketTeam.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });

    app.listen(3000, () => {
      console.log("Server running at https://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Connection Error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//convert dbobject to responseobject

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//API 1 Get all the list of players from the database

app.get("/players/", async (request, response) => {
  const getAllQuery = `SELECT * FROM CRICKET_TEAM  ORDER BY PLAYER_ID`;
  const queryResult = await db.all(getAllQuery);
  response.send(
    queryResult.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//To get the count of players in db

/*app.get("/count", async (request, response) => {
  let count = 0;
  const countQuery = `SELECT COUNT(*) AS LASTID FROM CRICKET_TEAM`;
  const res = await db.all(countQuery);
  //console.log(res);
  response.send(res);
});

*/

// API 2  Add a new player into db

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addQuery = `INSERT INTO cricket_team (player_name,jersey_number,role) VALUES ('${playerName}' , ${jerseyNumber} , '${role}')`;
  const res = await db.run(addQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const id = parseInt(playerId);
  const idQuery = `SELECT * FROM cricket_team WHERE player_id = ${id}`;
  const dbResult = await db.get(idQuery);
  response.send(convertDbObjectToResponseObject(dbResult));
});

app.put("/players/:playerId", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const { playerId } = request.params;
  const id = parseInt(playerId);
  const updateQuery = `UPDATE cricket_team SET player_name:'${playerName}',jersey_number:${jerseyNumber},role:'${role}'  WHERE player_id=${id}`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const id = parseInt(playerId);
  const deleteQuery = `DELETE FROM cricket_team WHERE player_id = ${id}`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
