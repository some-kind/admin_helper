// Добавляем обработчики событий
document.addEventListener("DOMContentLoaded", function() {

    // Генерация CSRF токена
    var csrfToken = generateCsrfToken();
    //console.log('Сгенерированный CSRF токен:', csrfToken);

    // Установка CSRF токена в cookies
    setCsrfCookie('csrftoken', csrfToken);

    // Запрос к серверу Django для получения данных о хостах
    fetch("/api/get_hosts/")
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            renderHostGroups(data.hosts);
            // Обработчик нажатия на группу для раскрытия
            document.querySelectorAll(".groupHeader").forEach(function(header) {
                header.addEventListener("click", toggleGroup);
            });

            // Обработчик нажатия на кнопку "удалить" у каждого хоста
            document.querySelectorAll(".delete-btn").forEach(function(button) {
                button.addEventListener("click", function() {
                    //console.log('Нажата кнопка Удалить');
                    // Получаем имя хоста из соответствующего блока
                    var hostName = this.parentElement.querySelector(".hostName").textContent;
                    //console.log('Выбран хост для удаления:', hostName);
                    // Отправляем запрос на удаление хоста
                    deleteHost(hostName);
                });
            });

            // Обработчик нажатия на кнопку "Добавить хост" в блоке для показа формы
            document.querySelectorAll(".add-host-btn").forEach(function(button) {
                button.addEventListener("click", toggleAddHost);
            });

            // Обработчик нажатия на кнопку "Добавить" в форме для обратного скрытия формы и отправки запроса
            document.querySelectorAll(".add-host-form-btn").forEach(function(button) {
                button.addEventListener("click", function(event) {
                    // Находим родительский элемент группы
                    var hostContainer = event.target.closest('.group');
                    if (hostContainer) {
                        // Ищем поля ввода и инфу о группе
                        var hostName = hostContainer.querySelector('.host_name').value;
                        var hostIp = hostContainer.querySelector('.host_ip').value;
                        var group = hostContainer.getAttribute('data-group');

                        // Проверка введённых данных
                        if (validateHostInput(hostName, hostIp)) {
                            // Формируем запрос
                            addHost(group, hostName, hostIp);
                            // Переключаем обратно кнопку
                            toggleAddHost(event);
                            // Очистить поля ввода после успешного добавления
                            hostContainer.querySelector('.host_name').value = '';
                            hostContainer.querySelector('.host_ip').value = '';
                            // Создаём новый блок нового хоста
                            createHostBlock(event, hostName, hostIp)
                        }
                    }
                });

                // Обработчик нажатия на кнопку "Отмена" в форме для её закрытия
                document.querySelectorAll(".close-form-btn").forEach(function(button) {
                    button.addEventListener("click", toggleAddHost);
                });
            });

        })
        .catch(function(error) {
            console.error("Error fetching data:", error);
        });



    // запрос к серверу django для получения данных о настройках
    // Получаем данные настроек с сервера
    fetch('/api/get_settings/')
        .then(function(response) {
           return response.json();
        })
        .then(function(data) {

            // Создаем выпадающий список для выбора настроек
            var selectSettings = document.createElement('select');

            // Создаем и добавляем варианты выбора настроек
            for (var setting in data.settings) {
              var option = document.createElement('option');
              option.value = data.settings[setting]['group'];
              option.textContent = data.settings[setting]['comment'];
              selectSettings.appendChild(option);
            }

            // Добавляем выпадающий список на страницу настроек
            document.getElementById('settingsSelect').appendChild(selectSettings);

            // Создаем блоки переменных
            renderSettingsGroups(data.settings);

            //console.log('Сгенерирована разметка настроек');
            // По умолчанию обновляем значения переменных для первой настройки
            showSettings(selectSettings.value);

            // Добавляем обработчик события изменения выбранной настройки
            selectSettings.addEventListener('change', function() {
                //console.log('Изменено значение в выпадающем списке на: ', this.value);
                showSettings(this.value);
            });
        })
        .catch(function(error) {
            console.error("Error fetching data:", error);
        });

});
