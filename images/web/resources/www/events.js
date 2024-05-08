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



});
