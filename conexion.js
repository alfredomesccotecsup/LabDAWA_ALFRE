const mysql = require('mysql');
const express = require('express');
const app = express();
const port = 3000;

// Configuración de la conexión a MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Alfredo24summy',
  database: 'laboratorio15',
});

// Conectar a MySQL
connection.connect((error) => {
  if (error) {
    console.error('Error al conectar a MySQL:', error);
    return;
  }
  console.log('Conexión a MySQL establecida');
});

// Configurar la aplicación Express
app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Rutas

// Ruta principal
app.get('/', (req, res) => {
  // Consulta para obtener todos los datos de alumnos
  connection.query('SELECT * FROM alumnos', (error, resultados) => {
    if (error) {
      console.error('Error al obtener datos de alumnos:', error);
      return;
    }
    res.render('index', { datos: resultados });
  });
});

// Ruta para eliminar un alumno
app.post('/eliminar/:id', (req, res) => {
  const id = req.params.id;
  const consulta = 'DELETE FROM alumnos WHERE id = ?';
  connection.query(consulta, [id], (error, results) => {
    if (error) {
      console.error('Error al eliminar alumno:', error);
      return;
    }
    res.redirect('/');
  });
});

// Ruta para editar un alumno
app.get('/editar/:id', (req, res) => {
  const id = req.params.id;
  const consulta = 'SELECT * FROM alumnos WHERE id = ?';
  connection.query(consulta, [id], (error, resultados) => {
    if (error) {
      console.error('Error al obtener dato del alumno:', error);
      return;
    }
    if (resultados.length === 0) {
      res.redirect('/');
    } else {
      res.render('editar', { dato: resultados[0] });
    }
  });
});

// Ruta para actualizar datos del alumno
app.post('/actualizar/:id', (req, res) => {
  const id = req.params.id;
  const nuevoDato = req.body.nuevoDato;
  const consulta = 'UPDATE alumnos SET columna1 = ? WHERE id = ?';
  connection.query(consulta, [nuevoDato, id], (error, results) => {
    if (error) {
      console.error('Error al actualizar alumno:', error);
      return;
    }
    res.redirect('/');
  });
});

// Ruta para agregar un nuevo alumno
app.post('/', (req, res) => {
  const nuevoDato = req.body.nuevoDato;
  const columna2 = req.body.columna2;
  const columna3 = req.body.columna3;
  const consulta = 'INSERT INTO alumnos (columna1, columna2, columna3) VALUES (?, ?, ?)';
  connection.query(consulta, [nuevoDato, columna2, columna3], (error, results) => {
    if (error) {
      console.error('Error al insertar alumno:', error);
      return;
    }
    res.redirect('/');
  });
});

app.get('/alumno/:id/cursos', (req, res) => {
  const idAlumno = req.params.id;

  // Consulta para obtener datos del alumno
  const consultaAlumno = 'SELECT * FROM alumnos WHERE id = ?';

  // Consulta para obtener cursos del alumno
  const consultaCursos = 'SELECT * FROM cursos WHERE id_alumno = ?';

  // Ejecutar ambas consultas en paralelo
  connection.query(consultaAlumno, [idAlumno], (errorAlumno, resultadoAlumno) => {
    if (errorAlumno) {
      console.error('Error al obtener datos del alumno:', errorAlumno);
      return;
    }

    // Verificar si se encontró el alumno
    if (resultadoAlumno.length === 0) {
      res.status(404).send('Alumno no encontrado');
      return;
    }

    // Obtener cursos del alumno después de obtener los datos del alumno
    connection.query(consultaCursos, [idAlumno], (errorCursos, resultadosCursos) => {
      if (errorCursos) {
        console.error('Error al obtener cursos del alumno:', errorCursos);
        return;
      }

      // Renderizar la plantilla con los datos del alumno y los cursos
      res.render('cursos-alumno', {
        alumno: resultadoAlumno[0],
        cursos: resultadosCursos,
      });
    });
  });
});


// Ruta para renderizar la plantilla de cursos
app.get('/cursos', (req, res) => {
  const consultaAlumnos = 'SELECT * FROM alumnos';
  // Consulta para obtener todos los cursos
  connection.query('SELECT * FROM cursos', (error, resultadosCursos) => {
    if (error) {
      console.error('Error al obtener cursos:', error);
      return;
    }

    // Consulta para obtener todos los alumnos
    connection.query('SELECT * FROM alumnos', (errorAlumnos, resultadosAlumnos) => {
      if (errorAlumnos) {
        console.error('Error al obtener alumnos:', errorAlumnos);
        return;
      }
      console.log('Número de alumnos:', resultadosAlumnos);
      // Renderiza la plantilla de cursos con la lista de cursos y alumnos
      res.render('cursos', { cursos: resultadosCursos, listaAlumnos: resultadosAlumnos });
    });
  });
});


// Ruta para renderizar la plantilla de cursos
app.get('/cursos', (req, res) => {
  // Consulta para obtener todos los cursos
  connection.query('SELECT * FROM cursos', (error, resultadosCursos) => {
    if (error) {
      console.error('Error al obtener cursos:', error);
      return;
    }

    // Consulta para obtener todos los alumnos
    connection.query('SELECT * FROM alumnos', (errorAlumnos, resultadosAlumnos) => {
      if (errorAlumnos) {
        console.error('Error al obtener alumnos:', errorAlumnos);
        return;
      }

      // Asegúrate de que resultadosAlumnos sea un array
      if (!Array.isArray(resultadosAlumnos)) {
        console.error('Error: resultadosAlumnos no es un array');
        return;
      }

      // Renderiza la plantilla de cursos con la lista de cursos y alumnos
      res.render('cursos', { cursos: resultadosCursos, listaAlumnos: resultadosAlumnos });
    });
  });
});

// Ruta para agregar un nuevo curso y redirigir a los cursos del alumno
app.post('/cursos/agregar', (req, res) => {
  const nuevoCurso = req.body.nuevoCurso;
  const profesor = req.body.profesor;
  const idAlumno = req.body.idAlumno;
  const consulta = 'INSERT INTO cursos (nombre, profesor, id_alumno) VALUES (?, ?, ?)';
  connection.query(consulta, [nuevoCurso, profesor, idAlumno], (error, results) => {
    if (error) {
      console.error('Error al insertar curso:', error);
      return;
    }
    res.redirect(`/alumno/${idAlumno}/cursos`);
  });
});

// Ruta para eliminar un curso
app.post('/eliminar-curso/:id', (req, res) => {
  const idCurso = req.params.id;
  const consulta = 'DELETE FROM cursos WHERE id = ?';
  connection.query(consulta, [idCurso], (error, results) => {
    if (error) {
      console.error('Error al eliminar curso:', error);
      return;
    }
    res.redirect('/cursos');
  });
});

// Ruta para editar un curso
app.get('/editar-curso/:id', (req, res) => {
  const idCurso = req.params.id;
  const consulta = 'SELECT * FROM cursos WHERE id = ?';
  connection.query(consulta, [idCurso], (error, resultados) => {
    if (error) {
      console.error('Error al obtener dato del curso:', error);
      return;
    }
    if (resultados.length === 0) {
      res.redirect('/cursos');
    } else {
      res.render('editar-curso', { curso: resultados[0] });
    }
  });
});

// Ruta para actualizar datos del curso
app.post('/actualizar-curso/:id', (req, res) => {
  const idCurso = req.params.id;
  const nuevoCurso = req.body.nuevoCurso;
  const profesor = req.body.profesor;
  const idAlumno = req.body.idAlumno;
  const consulta = 'UPDATE cursos SET nombre = ?, profesor = ?, id_alumno = ? WHERE id = ?';
  connection.query(consulta, [nuevoCurso, profesor, idAlumno, idCurso], (error, results) => {
    if (error) {
      console.error('Error al actualizar curso:', error);
      return;
    }
    res.redirect('/cursos');
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
