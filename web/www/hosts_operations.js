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

// Функция для добавления хоста
function addHost() {
    // Получаем значения полей ввода
    var group = document.querySelector(".groupHeader h4").textContent.trim();
    var hostNameInput = document.getElementById("hostNameInput");
    var hostIPInput = document.getElementById("hostIPInput");
    var host_name = hostNameInput.value.trim();
    var host_ip = hostIPInput.value.trim();

    // Проверяем, что поля не пустые
    if (!host_name || !host_ip) {
        alert("Имя хоста и IP-адрес должны быть заполнены.");
        return;
    }

    // Проверяем правильность формата IP-адреса
    if (!isValidIP(host_ip)) {
        alert("Неправильный формат IP-адреса.");
        return;
    }

    // Отправляем POST-запрос на сервер
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/add_host/");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.status === "success") {
                alert("Хост успешно добавлен.");
                // Очищаем поля ввода после успешного добавления
                hostNameInput.value = "";
                hostIPInput.value = "";
            } else {
                alert("Ошибка: " + response.message);
            }
        } else {
            alert("Произошла ошибка: " + xhr.responseText);
        }
    };
    xhr.send("group=" + encodeURIComponent(group) + "&host_name=" + encodeURIComponent(host_name) + "&host_ip=" + encodeURIComponent(host_ip));
}

// Проверка корректности формата IP-адреса
function isValidIP(ip) {
    var ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
    return ipRegex.test(ip);
}