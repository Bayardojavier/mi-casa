import React from 'react';

function ModuloList({ proyecto, onSelectModulo }) {
  const modulos = [
    { id: 1, nombre: 'Limpieza y Nivelación' },
    { id: 2, nombre: 'Plomería y Acueducto' }
  ];

  return (
    <div>
      <h2>Módulos del proyecto: {proyecto.nombre}</h2>
      <ul>
        {modulos.map(modulo => (
          <li
            key={modulo.id}
            style={{ cursor: 'pointer', margin: '5px 0' }}
            onClick={() => onSelectModulo(modulo)}
          >
            {modulo.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ModuloList;
