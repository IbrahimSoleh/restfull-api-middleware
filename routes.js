const { Router } = require("express");
const router = Router();
const pool = require("./db");
const bacrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authorizationUser } = require("./middleware/auth");
const privatekey = "mantapp";
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

// users
router.get("/Users", (req, res) => {
  console.log(req.logUser);
  console.log(req.query);
  const { limit, page } = req.query;

  let resultLimit = limit ? +limit : DEFAULT_LIMIT;
  let resultPage = page ? +page : DEFAULT_PAGE;
  const findAllUser = `SELECT * FROM users LIMIT ${resultLimit} OFFSET ${
    (resultPage - 1) * resultLimit
  }`;
  pool.query(findAllUser, (error, results) => {
    if (error) throw error;
    res.json(results.rows);
  });
});

router.get("/users/:id", (req, res) => {
  const findUserById = `SELECT * FROM users WHERE id = ${req.params.id}`;
  pool.query(findUserById, (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
});

// movies
router.get("/movies", (req, res) => {
  console.log(req.query);
  const { limit, page } = req.query;

  let resultLimit = limit ? +limit : DEFAULT_LIMIT;
  let resultPage = page ? +page : DEFAULT_PAGE;

  console.log(resultLimit, resultPage);
  const findAllMovies = `SELECT * FROM movies LIMIT ${resultLimit} OFFSET ${
    (resultPage - 1) * resultLimit
  }`;
  pool.query(findAllMovies, (error, results) => {
    if (error) throw error;
    res.json(results.rows);
  });
});

router.get("/movies/:id", (req, res) => {
  const findMoviesById = `SELECT * FROM movies WHERE id = ${req.params.id}`;
  pool.query(findMoviesById, (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
});

router.post("/movies", (req, res) => {
  const createMovies = `INSERT INTO movies ("id", "title", "genres", "year") VALUES ($1, $2, $3, $4)`;
  pool.query(
    createMovies,
    [req.body.id, req.body.title, req.body.genres, req.body.year],
    (error, results) => {
      if (error) throw error;
      res.status(201).send("Data Created Successfully");
    }
  );
});

router.delete("/movies/:id", authorizationUser, (req, res) => {
  const deleteMoviesById = `DELETE FROM movies WHERE id = ${req.params.id}`;
  pool.query(deleteMoviesById, (error, results) => {
    if (error) throw error;
    res.status(201).send(`Delete id ${req.params.id} Successfully`);
  });
});

router.put("/movies/:id", (req, res) => {
  const updateMoviesTitle = `UPDATE movies SET title = $1 WHERE id = $2`;
  pool.query(
    updateMoviesTitle,
    [req.body.title, req.params.id],
    (error, results) => {
      if (error) throw error;
      res.status(201).send(`id ${req.params.id} Title Updated Successfully`);
    }
  );
});

// login
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;
  const findUser = `SELECT * FROM users WHERE email = $1`;
  pool.query(findUser, [email], (error, result) => {
    if (error) next(error);
    if (result.rows.length === 0) {
      next({ message: "wrong password" });
    } else {
      const dataUsers = result.rows[0];
      const dataAuthUser = { id: dataUsers.id, email: dataUsers.email };
      console.log(dataAuthUser);
      const comparePassword = bacrypt.compareSync(password, dataUsers.password);
      if (comparePassword) {
        const accessToken = jwt.sign(dataAuthUser, privatekey);

        res
          .status(200)
          .send(
            `Users data: ${JSON.stringify(
              dataAuthUser
            )}, Access token : ${accessToken}`
          );
      } else {
        next({ Message: error });
      }
    }
  });
});

// register
router.post("/register", (req, res, next) => {
  const { id, email, gender, password, role } = req.body;

  const salt = bacrypt.genSaltSync(8);
  const hash = bacrypt.hashSync(password, salt);

  const addUsers = `INSERT INTO users (id, email, gender, password, role) VALUES ($1, $2, $3, $4, $5)`;

  pool.query(addUsers, [id, email, gender, hash, role], (error, result) => {
    if (error) next(error);
    res.status(201).send("Registration Succesfully");
  });
});

module.exports = router;
