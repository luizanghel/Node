require('dotenv').config();

const express = require('express');
const path = require('path');
const datos = require('./data/ebooks.json'); 

const app = express();
// Indicar la ruta de los ficheros estáticos
app.use(express.static(path.join(__dirname, "../public")))

//////
//process.loadEnvFile() no necesario, instalando el dotenv
const PORT = process.env.PORT 

// Configura Express para servir archivos estáticos desde la carpeta actual
app.use(express.static(path.join(__dirname)));

// Ruta principal para enviar el archivo `index.html`
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/src/principal.html'));
});

// RUTA API AUTORES ORDENADOS 
app.get('/api', (req, res) => {
  // Ordenar por apellido del autor(descendente A->Z)
  const autoresOrdenados = datos.sort((a, b) => a.autor_apellido.localeCompare(b.autor_apellido, "es-ES"));
  //console.log(datos);
  res.json(autoresOrdenados);
});

// RUTA API AUTORES POR APELLIDO

app.get("/api/apellido/:autor_apellido" , (req, res) => {
  const apellido = req.params.autor_apellido.toLocaleLowerCase()
  const filtroAutor = datos.filter(autor => autor.autor_apellido.toLocaleLowerCase() == apellido)
  // console.log(filtroClientes);
  if (filtroAutor.length == 0) {
      return res.status(404).send("Autor no encontrado")
  }
  res.json(filtroAutor)
})


// RUTA API AUTORES POR NOMBRE Y APELLIDO

app.get("/api/nombre_apellido/:autor_nombre/:autor_apellido" , (req, res) => {
  const apellido = req.params.autor_apellido.toLocaleLowerCase()
  const nombre = req.params.autor_nombre.toLocaleLowerCase()

  const filtroAutor = datos.filter(autor => autor.autor_apellido.toLocaleLowerCase() == apellido && autor.autor_nombre.toLocaleLowerCase() == nombre)
  // console.log(filtroClientes);
  if (filtroAutor.length == 0) {
      return res.status(404).send("Autor no encontrado")
  }
  res.json(filtroAutor)
})

// RUTA API AUTORES POR PRIMERAS LETRAS DEL APELLIDO

app.get("/api/nombre/:nombre", (req, res) => {
  const nombre = req.params.nombre.toLowerCase(); 
  const apellido = req.query.apellido; 

  // ERROR SOLICITADO
  if (apellido === undefined) {
      return res.status(400).send("Falta el parámetro apellido");
  }

  const letras = apellido.length;

  const filtroAutores = datos.filter(autor => 
    autor.autor_nombre && autor.autor_apellido && 
    autor.autor_nombre.toLowerCase() === nombre &&
    autor.autor_apellido.slice(0, letras).toLowerCase() === apellido.toLowerCase()
  );

  if (filtroAutores.length === 0) {
      return res.status(404).send("Autor no encontrado");
  }
  // Devolvemos los datos filtrados
  res.json(filtroAutores);
});


// Filtramos los libros por año

app.get("/api/edicion/:anio", (req, res) => {
  const anio = req.params.anio; 

  if (!/^\d+$/.test(anio)) { 
      return res.status(400).send("Año de edición no válido");
  }
  const anioNumero = parseInt(anio);

  const obrasPorAnio = [];
  
  datos.forEach(autor => {
      
      const obrasFiltradas = autor.obras.filter(obra => obra.edicion === anioNumero);
      obrasPorAnio.push(...obrasFiltradas);
  });

  if (obrasPorAnio.length === 0) {
      return res.status(404).send("No se encontraron obras para el año indicado");
  }

  res.json(obrasPorAnio);
  });

// ERROR

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '/src/error.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});