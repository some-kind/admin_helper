// Функция для отправки запроса на удаление хоста
function deleteHost(hostName) {
    var url = '/api/delete_host/';

    // Получение CSRF токена из cookies
    var csrftoken = getCookie('csrftoken');

    //console.log('Куки 2:', csrftoken);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // Установка CSRF токена в заголовок запроса
    xhr.setRequestHeader('X-CSRFToken', csrftoken);

    xhr.onload = function() {
        if (xhr.status === 200) {
            //console.log('Хост успешно удален:', xhr.responseText);
            // Перезагрузка страницы для обновления данных
            // location.reload();
            // Удаление блока хоста из HTML
            var hostElements = document.querySelectorAll('.host');
            hostElements.forEach(function(hostElement) {
                var hostSpan = hostElement.querySelector('.hostName');
                if (hostSpan && hostSpan.textContent === hostName) {
                    hostElement.remove();
                }
            });
        } else {
            console.error('Произошла ошибка:', xhr.responseText);
        }
    };
    xhr.send('host_name=' + encodeURIComponent(hostName));
    //console.log('Отправлен запрос на удаление хоста:', hostName);
}