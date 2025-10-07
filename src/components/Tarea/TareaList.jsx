import React from 'react';

function TareaList({ modulo }) {
  const tareas = [
    { id: 1, nombre: 'Sanjeo de tuberías' },
    { id: 2, nombre: 'Colocación de bloques' }
  ];

  return (
    <div>
      <h2>Tareas del módulo: {modulo.nombre}</h2>
      <ul>
        {tareas.map(tarea => (
          <li key={tarea.id} style={{ margin: '5px 0' }}>
            {tarea.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TareaList;
