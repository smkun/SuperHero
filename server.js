const express = require('express');
const mongoose = require('mongoose');
const Superhero = require('./models/Superhero');
const methodOverride = require('method-override');
const { getNextSequence } = require('./utils/sequence');
const { handleFight } = require("./utils/fightUtils");

const app = express();
const port = 3000;

require('dotenv').config();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Handle favicon.ico requests first to avoid unnecessary processing
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// INDEX route
app.get('/', async (req, res) => {
  try {
    const superheroes = await Superhero.find();
    res.render('index', { superheroes });
  } catch (error) {
    console.error('Error fetching superheroes:', error);
    res.status(500).send('Internal Server Error');
  }
});

// NEW route
app.get('/new', (req, res) => {
  res.render('new');
});

// GET route to display fight form and list of heroes
app.get("/fight", async (req, res) => {
  try {
      const superheroes = await Superhero.find();
      res.render("fight", { superheroes }); // No fight data passed initially
  } catch (error) {
      console.error("Error fetching superheroes:", error);
      res.status(500).send("Internal Server Error");
  }
});

// POST route to handle the fight logic
app.post("/fight", async (req, res) => {
  console.log("Received fight request with:", req.body);
  const { hero1Name, hero2Name } = req.body;
  try {
      const hero1 = await Superhero.findOne({ name: hero1Name });
      const hero2 = await Superhero.findOne({ name: hero2Name });

      if (!hero1 || !hero2) {
          return res.status(404).send("One or both heroes not found");
      }

      const { winner, imageUrl } = await handleFight(hero1, hero2);
      // Use URL encoding to pass parameters safely
      res.redirect(`/fight/results?hero1=${encodeURIComponent(hero1.name)}&hero2=${encodeURIComponent(hero2.name)}&winner=${encodeURIComponent(winner.name)}&imageUrl=${encodeURIComponent(imageUrl)}&winnerImage=${encodeURIComponent(winner.image.url)}`);
  } catch (error) {
      console.error("Error during hero fight:", error);
      res.status(500).send("Internal Server Error");
  }
});

// GET route for displaying fight results
app.get("/fight/results", async (req, res) => {
  const { hero1, hero2, winner, imageUrl, winnerImage } = req.query;
  res.render("fightResults", {
      hero1Name: hero1,
      hero2Name: hero2,
      winnerName: winner,
      imageUrl,
      winnerImage
  });
});


// CREATE route
app.post('/', async (req, res) => {
  try {
    const superhero = new Superhero({
      _id: await getNextSequence('superheroID'),
      ...req.body,
    });
    await superhero.save();
    res.redirect('/');
  } catch (error) {
    console.error('Error creating superhero:', error);
    res.status(500).send('Internal Server Error');
  }
});

// POST route to handle the fight logic and display results
app.post("/fight", async (req, res) => {
  console.log("Received fight request with:", req.body);
  const { hero1Name, hero2Name } = req.body;
  try {
      const hero1 = await Superhero.findOne({ name: hero1Name });
      const hero2 = await Superhero.findOne({ name: hero2Name });

      if (!hero1 || !hero2) {
          return res.status(404).send("One or both heroes not found");
      }

      const { winner, imageUrl } = await handleFight(hero1, hero2);
      res.render("fight", {
          superheroes: await Superhero.find(), // Include this to allow new selections
          hero1,
          hero2,
          winner,
          imageUrl,
          winnerImage: winner.image.url
      });
  } catch (error) {
      console.error("Error during hero fight:", error);
      res.status(500).send("Internal Server Error");
  }
});

// Dynamic routes for specific superhero handling
// EDIT route
app.get('/:id/edit', async (req, res) => {
  try {
    const superhero = await Superhero.findById(req.params.id);
    res.render('edit', { superhero });
  } catch (error) {
    console.error('Error fetching superhero:', error);
    res.status(500).send('Internal Server Error');
  }
});

// SHOW route
app.get('/:id', async (req, res) => {
  try {
    const superhero = await Superhero.findById(req.params.id);
    res.render('show', { superhero });
  } catch (error) {
    console.error('Error fetching superhero:', error);
    res.status(500).send('Internal Server Error');
  }
});

// UPDATE route
app.put('/:id', async (req, res) => {
  try {
    await Superhero.findByIdAndUpdate(req.params.id, req.body);
    res.redirect(`/${req.params.id}`);
  } catch (error) {
    console.error('Error updating superhero:', error);
    res.status(500).send('Internal Server Error');
  }
});

// DELETE route
app.delete('/:id', async (req, res) => {
  try {
    await Superhero.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting superhero:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
