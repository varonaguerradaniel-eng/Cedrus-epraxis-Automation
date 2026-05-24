// ==UserScript==
// @name         CedrusMed – automático Facilitator Intervention no tocar
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Pega frases que comienzan con "The facilitator" en el campo Facilitator Intervention, con base de datos local.
// @match        https://www.cedrusmed.com/cmhp/schedule/calendar
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const FIELD_SELECTOR = 'textarea[formcontrolname="FacilitatorIntervention"]';

  function insertarUI(campo, idx) {
    if (campo.parentNode.querySelector(`.db-wrapper-facilitator-${idx}`)) return;

    const key = `dbFacilitator_${idx}`;
    const wrapper = document.createElement('div');
    wrapper.className = `db-wrapper-facilitator-${idx}`;
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'flex-end';
    wrapper.style.marginTop = '5px';
    wrapper.style.zIndex = '1000';

    // Botón Clear
    const btnClear = document.createElement('button');
    btnClear.textContent = 'Clear DB';
    Object.assign(btnClear.style, {
      margin: '0 0 4px 0',
      padding: '2px 6px',
      cursor: 'pointer',
      background: 'transparent',
      color: '#f44336'
    });
    btnClear.onclick = () => {
      localStorage.removeItem(key);
      db.value = '';
    };

    // Botón Facilitator
    const btn = document.createElement('button');
    btn.textContent = 'Facilitator';
    Object.assign(btn.style, {
      background: 'transparent',
      color: '#3f51b5',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
      marginBottom: '4px'
    });
    btn.onclick = () => {
      const text = db.value;
      const regex = /\bThe facilitator\b.*?[\.\n]/g; // busca frases que empiecen con "The facilitator" hasta un punto o salto de línea
      let m, entries = [];
      while ((m = regex.exec(text))) entries.push(m[0].trim());
      if (!entries.length) return alert('❌ No se encontró ninguna frase que comience con "The facilitator".');

      const entry = entries.shift();

      campo.value = entry;
      campo.dispatchEvent(new Event('input', { bubbles: true }));

      db.value = text.replace(entry, '').trim();
      localStorage.setItem(key, db.value);
    };

    // Textarea de base de datos
    const db = document.createElement('textarea');
    db.rows = 4;
    db.placeholder = 'Base de datos (frases que empiecen con "The facilitator")';
    Object.assign(db.style, {
      width: '100%',
      border: '1px solid #ccc',
      color: '#3f51b5'
    });
    db.value = localStorage.getItem(key) || '';
    db.oninput = () => localStorage.setItem(key, db.value);

    // Montaje
    wrapper.appendChild(btnClear);
    wrapper.appendChild(btn);
    wrapper.appendChild(db);
    campo.parentNode.insertBefore(wrapper, campo.nextSibling);
  }

  setInterval(() => {
    document.querySelectorAll(FIELD_SELECTOR).forEach((campo, idx) => insertarUI(campo, idx));
  }, 1000);
})();
