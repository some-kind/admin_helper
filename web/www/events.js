// Добавляем обработчики событий
document.addEventListener("DOMContentLoaded", function() {

    // Генерация CSRF токена
    var csrfToken = generateCsrfToken();
    //console.log('Сгенерированный CSRF токен:', csrfToken);

    // Установка CSRF токена в cookies
    setCsrfCookie('csrftoken', csrfToken);

    // Запрос к серверу Django для получения данных о хостах
    fetch("/api/parse_hosts/")
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
                button.addEventListener("click", toggleAddHost);
            });
        })
        .catch(function(error) {
            console.error("Error fetching data:", error);
        });



});
