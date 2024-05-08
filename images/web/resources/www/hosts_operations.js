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

// Функция формирования запроса POST на добавление хоста
function addHost(group, hostName, hostIp) {
    var url = '/api/add_host/';
    //var url = 'http://192.168.0.197:8000/add_host/';

    // Получение CSRF токена из cookies
    var csrftoken = getCookie('csrftoken');

    // console.log('Добавляем хост', hostName, ' ', hostIp, 'в группу:', group);

    // Формируем тело запроса
    var formData = new FormData();
    formData.append('group', group);
    formData.append('host_name', hostName);
    formData.append('host_ip', hostIp);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('X-CSRFToken', csrftoken); // Установка CSRF токена в заголовок запроса

    xhr.onload = function() {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.status === 'success') {
                console.log('Хост успешно добавлен:', response.message);

            } else {
                console.error('Произошла ошибка:', response.message);
            }
        } else {
            console.error('Произошла ошибка:', xhr.statusText);
        }
    };

    xhr.send(formData);

}

// Функция для проверки введенных данных перед добавлением нового хоста
function validateHostInput(hostNameInput, hostIpInput) {

    // Проверка, что host_name не пустой
    if (hostNameInput === '') {
        alert('Введите имя хоста');
        return false;
    }

    // Проверка на совпадение введенного host_name с уже существующими
    var existingHostNames = document.querySelectorAll('.hostName');
    for (var i = 0; i < existingHostNames.length; i++) {
        if (existingHostNames[i].textContent === hostNameInput) {
            alert('Хост с таким именем уже существует');
            return false;
        }
    }

    // Проверка на соответствие введенного IP адреса формату
    var ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(hostIpInput)) {
        alert('Неверный формат IP адреса');
        return false;
    }

    return true;
}

// Функция для создания нового блока хоста и добавления его в список хостов
function createHostBlock(event, hostName, hostIp) {
    // Создаем новый элемент div для хоста
    var hostElement = document.createElement('div');
    hostElement.classList.add('host');

    // Создаем элементы span для имени хоста и его IP-адреса
    var nameSpan = document.createElement('span');
    nameSpan.classList.add('hostName');
    nameSpan.textContent = hostName;

    var ipSpan = document.createElement('span');
    ipSpan.classList.add('hostIP');
    ipSpan.textContent = hostIp;

    // Создаем кнопку для удаления хоста
    var deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn', 'delete-btn');
    deleteBtn.textContent = 'Удалить';

    // Добавляем элементы внутрь блока хоста
    hostElement.appendChild(nameSpan);
    hostElement.appendChild(ipSpan);
    hostElement.appendChild(deleteBtn);

    // Находим блок hostsList и добавляем в него созданный блок хоста
    var hostsList = event.target.closest('.hostsManager').querySelector('.hostsList');
    hostsList.appendChild(hostElement);
}