# Los Chavales

Juego de parejas con fotos de la pandilla, hecho con HTML, CSS, JavaScript, Node.js (Express) y MongoDB Atlas.

- Tablero de 6x5 (15 parejas)
- 60 segundos, que empiezan a contar con el primer click en una carta
- Acierto +20 puntos, fallo -10 puntos, +40 si terminas antes de que se acabe el tiempo
- Las puntuaciones se guardan en MongoDB Atlas (base `loschavales`, colección `puntuaciones`) y la pantalla inicial muestra el top 5