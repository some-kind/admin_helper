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

            // Добавляем обработчик изменения переменных, чтобы отобразить кнопку "Сохранить"
            document.querySelectorAll(".varValue").forEach(function(textarea) {
                textarea.addEventListener("input", function(event){
                    //console.log('Изменение поля');
                    var varBlock = event.target.closest(".varBlock");
                    var varBtnSave = varBlock.querySelector(".varBtnSave");
                    varBtnSave.classList.add("open");

                    // Проверка, что введённое значение равно исходному (тогда убираем кнопку)
                    var settingBlock = event.target.closest(".setting");
                    var dataSetting = settingBlock.dataset.setting;
                    var varName = varBlock.querySelector(".varName").textContent;

                    //console.log("dataSetting: ", dataSetting);
                    //console.log("varName: ", varName);

                    data.settings.forEach(function(group) {
                        if (group.group === dataSetting) {
                            //console.log("group.group: ", group.group);
                            //console.log("group.vars[varName]: ", group.vars[varName].value);
                            //console.log("textarea.value: ", textarea.value);
                            if (group.vars[varName].value === textarea.value) {
                                varBtnSave.classList.remove("open");
                            }
                        }
                    });
                });
            });


            // Обработчик нажатия на кнопку "Сохранить" у переменной
            document.querySelectorAll(".varBtnSave").forEach(function(button) {
                button.addEventListener("click", function(event) {
                    // Находим родительский элемент группы настроек
                    var settingContainer = event.target.closest('.setting');

                    if (settingContainer) {
                        // Ищем инфу для переменной
                        var nameSetting = settingContainer.dataset.setting;
                        var varName = event.target.closest('.varBlock').querySelector('.varName').textContent;
                        var varValue = event.target.closest('.varBlock').querySelector('.varValue').value;

                        // отладка
                        //console.log("Формируем запрос на изменение:", nameSetting, " ", varName, " ", varValue);

                        // Формируем запрос
                        changeVars(nameSetting, varName, varValue);

                        // Перезагрузка страницы (старый вариант)
                        //location.reload();

                        // Меняем значение в полученном массиве
                        data.settings.forEach(function(group) {
                            if (group.group === nameSetting) {
                                //console.log("group.group: ", group.group);
                                //console.log("group.vars[varName]: ", group.vars[varName].value);
                                //console.log("textarea.value: ", textarea.value);
                                // меняем значение на новое
                                group.vars[varName].value = varValue
                                // Убираем видимость кнопки сохранить
                                event.target.classList.remove("open");
                            }
                        });
                    }
                });

            });

            // отрисовка страницы RUN
            //
            // Создаем выпадающий список для выбора Плейбука для запуска
            var selectSettings = document.createElement('select');

            // Создаем и добавляем варианты выбора Плейбука для запуска
            for (var setting in data.settings) {
              if (data.settings[setting]['group'] != 'basic_settings') {
                var option = document.createElement('option');
                option.value = data.settings[setting]['group'];
                option.textContent = data.settings[setting]['comment'];
                selectSettings.appendChild(option);
              }
            }

            // Добавляем выпадающий список на страницу запуска
            document.getElementById('runSelect').appendChild(selectSettings);

            // Обработчик нажатия на кнопку "Запуск" плейбука
            document.querySelectorAll(".runBtn").forEach(function(button) {
                button.addEventListener("click", function() {
                    var selectedValue = document.querySelector('.runSelect select').value;

                    console.log("Запуск плейбука:", selectedValue);
                    fetchLogs(selectedValue);

                });
            });

        })
        .catch(function(error) {
            console.error("Error fetching data:", error);
        });



});
