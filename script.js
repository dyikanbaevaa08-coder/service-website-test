(function () {
  'use strict';

  // WhatsApp: добавляем готовый текст к ссылкам. Номер берётся из самой ссылки.
  document.querySelectorAll('a[data-wa-text]').forEach(function (link) {
    link.href = link.href + '?text=' + encodeURIComponent(link.dataset.waText);
  });

  // Круглые кнопки появляются, когда кнопки первого экрана ушли за край.
  var fab = document.querySelector('.fab');
  var heroActions = document.querySelector('.hero__actions');

  if (fab && heroActions && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      fab.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { rootMargin: '-80px 0px 0px 0px' }).observe(heroActions);
  }

  // Меню на телефоне
  var burger = document.getElementById('burger');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }

  burger.addEventListener('click', function () {
    setMenu(!nav.classList.contains('is-open'));
  });

  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      burger.focus();
    }
  });

  document.addEventListener('click', function (event) {
    if (nav.classList.contains('is-open') && !event.target.closest('.site-header')) setMenu(false);
  });

  // Переключатель техники. Без JavaScript все цены просто видны списком.
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

  function selectTab(tab, moveFocus) {
    tabs.forEach(function (other) {
      var isActive = other === tab;
      other.setAttribute('aria-selected', String(isActive));
      other.tabIndex = isActive ? 0 : -1;
      document.getElementById(other.getAttribute('aria-controls')).hidden = !isActive;
    });
    if (moveFocus) tab.focus();
  }

  if (tabs.length) {
    selectTab(tabs[0], false);

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () { selectTab(tab, false); });
      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
        if (event.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === 'Home') next = tabs[0];
        if (event.key === 'End') next = tabs[tabs.length - 1];
        if (next) {
          event.preventDefault();
          selectTab(next, true);
        }
      });
    });
  }

  // Заявка: проверяем поля, собираем сообщение и открываем WhatsApp.
  var form = document.getElementById('request-form');
  if (!form) return;

  function isPhoneValid(value) {
    var digits = value.replace(/\D/g, '');
    return /^(996\d{9}|0\d{9}|\d{9})$/.test(digits);
  }

  function setError(input, hasError) {
    var error = document.getElementById(input.id + '-error');
    error.hidden = !hasError;
    if (hasError) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
  }

  var nameInput = form.elements.name;
  var phoneInput = form.elements.phone;

  nameInput.addEventListener('input', function () {
    if (nameInput.value.trim()) setError(nameInput, false);
  });

  phoneInput.addEventListener('input', function () {
    if (isPhoneValid(phoneInput.value)) setError(phoneInput, false);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var name = nameInput.value.trim();
    var phone = phoneInput.value.trim();
    var nameBad = !name;
    var phoneBad = !isPhoneValid(phone);

    setError(nameInput, nameBad);
    setError(phoneInput, phoneBad);

    if (nameBad || phoneBad) {
      (nameBad ? nameInput : phoneInput).focus();
      return;
    }

    var lines = [
      'Здравствуйте! Заявка с сайта «Починим».',
      'Имя: ' + name,
      'Телефон: ' + phone
    ];

    [
      ['Техника, модель или сантехника', form.elements.device],
      ['Адрес', form.elements.address],
      ['Удобное время', form.elements.time],
      ['Описание поломки', form.elements.problem]
    ].forEach(function (item) {
      var value = item[1].value.trim();
      if (value) lines.push(item[0] + ': ' + value);
    });

    var url = form.action + '?text=' + encodeURIComponent(lines.join('\n'));
    window.open(url, '_blank', 'noopener');
  });
})();
