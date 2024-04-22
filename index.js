import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

// Configure EJS as the view engine
app.set("view engine", "ejs");

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Books",
    password: "2021shula",
    port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Route to display all books
app.get("/", async (req, res) => {
  try {
      let query = 'SELECT * FROM books';
      const sortBy = req.query.sort; // Get the sorting option from the query parameters
      console.log(sortBy);
      // Add sorting condition to the query based on the selected option
      if (sortBy === 'date') {
          query += ' ORDER BY date_read DESC'; // Assuming 'date_read' is the column name
      } else if (sortBy === 'rating') {
          query += ' ORDER BY rating DESC'; // Assuming 'rating' is the column name
      }

      const result = await db.query(query);
      const books = result.rows;
      res.render("home", { books });
  } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).send('Error fetching books');
  }
});




app.get("/add-book", (req, res) => {
  res.render("add.ejs", { message: null });
});

app.post('/add-book', async (req, res) => {
  try {
      const { title, author, isbn, review, Rating, date_read } = req.body;

      // Check if the book already exists in the database
      const existingBook = await db.query('SELECT id FROM books WHERE isbn = $1', [isbn]);
      if (existingBook.rows.length > 0) {
          // If the book already exists, send a message to the user
          return res.render("add.ejs", { message: 'The book is already entered.' });
      }

      // If the book does not exist, insert it into the database
      const queryText = 'INSERT INTO books (title, author, isbn, review, Rating, date_read) VALUES ($1, $2, $3, $4, $5, $6)';
      await db.query(queryText, [title, author, isbn, review, Rating, date_read]);
      res.redirect('/');
  } catch (error) {
      console.error('Error inserting book:', error);
      res.status(500).send('Internal Server Error');
  }
});




app.post("/edit", async (req, res) => {
  const updatedReview = req.body.updatedReview;
  const id = req.body.updateBookId;
  console.log(updatedReview);
  console.log(id);
  try {
      await db.query("UPDATE Books SET review = $1 WHERE id = $2", [updatedReview, id]);
      res.redirect('/');
  } catch (err) {
      console.error(err);
      res.sendStatus(500); // Send a server error status code
  }
});










app.post("/delete", async (req, res) => {
    const id = req.body.deleteBookId;
    try {
      await db.query("DELETE FROM Books WHERE id = $1", [id]);
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  });



  

app.listen(port, () => {
    console.log(`server started running on port ${port}`);
});
