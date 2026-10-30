// Servidor de "Los Chavales" (Node.js + Express + MongoDB Atlas)
require('dotenv').config({ quiet: true });

let express = require('express');
let MongoClient = require('mongodb').MongoClient;

// Usamos los DNS de Google para que no falle la búsqueda del cluster (error querySrv) (me ha fallado anteriormente y por eso utilizo esto)
let dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

// La cadena de conexión está en el archivo .env
let cadenaConexion = process.env.MONGO_URI;

if (!cadenaConexion) {
  console.log('Falta MONGO_URI. Crea un archivo .env (mira .env.example)');
  process.exit();
}

let app = express();
let cliente = new MongoClient(cadenaConexion);
let puntuaciones; // se rellena cuando nos conectamos a Atlas

// Para leer el JSON que envía el navegador y para servir la carpeta public
app.use(express.json());
app.use(express.static('public'));

// Devuelve los 5 mejores ordenados según su puntuación
app.get('/api/top5', function (req, res) {
  puntuaciones.find().sort({ score: -1 }).limit(5).toArray()
    .then(function (lista) {
      res.json(lista);
    })
    .catch(function (error) {
      console.log(error);
      res.status(500).json({ error: 'No se pudo leer el ranking' });
    });
});

// Aquí guardo la puntuación
app.post('/api/puntuacion', function (req, res) {
  let recibido = req.body || {};
  let jugador = recibido.jugador;
  let score = Number(recibido.score);

  // El jugador no puede estar vacío y el score tiene que ser un número
  if (typeof jugador != 'string' || jugador.trim() == '' || !isFinite(score)) {
    res.status(400).json({ error: 'Datos no válidos' });
    return;
  }
  jugador = jugador.trim().substring(0, 20);

  puntuaciones.insertOne({ jugador: jugador, score: score })
    .then(function () {
      res.json({ ok: true });
    })
    .catch(function (error) {
      console.log(error);
      res.status(500).json({ error: 'No se pudo guardar la puntuación' });
    });
});

// Conexión Atlas y arranque server
cliente.connect()
  .then(function () {
    puntuaciones = cliente.db('loschavales').collection('puntuaciones');
    console.log('Conectado a MongoDB Atlas');
    app.listen(3000, function () {
      console.log('Juego en http://localhost:3000');
    });
  })
  .catch(function (error) {
    console.log('Error al conectar con Atlas:');
    console.log(error.message);
  });
