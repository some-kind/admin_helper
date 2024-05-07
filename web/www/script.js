// переключение между вкладками
function openTab(tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  event.currentTarget.className += " active";
}


// Функция для отображения групп хостов на основе данных из JSON
function renderHostGroups(hostsData) {
    var hostsContainer = document.getElementById("hostsContainer");
    hostsContainer.innerHTML = ''; // Очищаем контейнер перед отображением новых данных

    hostsData.forEach(function(group) {
        var groupDiv = document.createElement("div");
        groupDiv.className = "group";
        if (group.isOpen) {
            groupDiv.classList.add("open");
        }
        groupDiv.setAttribute("data-group", group.group);

        var groupHeader = document.createElement("div");
        groupHeader.className = "groupHeader";
        groupHeader.innerHTML = "<h4>" + group.group + "</h4><div class='comment'>" + group.comment + "</div>";
        groupDiv.appendChild(groupHeader);

        var hostsManager = document.createElement("div");
        hostsManager.className = "hostsManager";

        var hostsList = document.createElement("div");
        hostsList.className = "hostsList";
        for (var hostname in group.hosts_list) {
            if (group.hosts_list.hasOwnProperty(hostname)) {
                var hostDiv = document.createElement("div");
                hostDiv.className = "host";
                hostDiv.innerHTML = "<span class='hostName'>" + hostname + "</span><span class='hostIP'>" + group.hosts_list[hostname] + "</span><button class='btn delete-btn'>Удалить</button>";
                hostsList.appendChild(hostDiv);
            }
        }

        hostsManager.appendChild(hostsList);

        var addHostBtn = document.createElement("button");
        addHostBtn.className = "btn add-host-btn";
        addHostBtn.innerHTML = "Добавить хост";
        hostsManager.appendChild(addHostBtn);

        groupDiv.appendChild(hostsManager);
        hostsContainer.appendChild(groupDiv);
    });
}


// Функция для обработки нажатия на заголовок группы хостов
function toggleGroup(event) {
    var groupHeader = event.target.closest(".groupHeader");
    if (groupHeader) {
        var groupContainer = groupHeader.parentElement;
        groupContainer.classList.toggle("open");
    }
}


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

            // Обработчик нажатия на кнопки "удалить" у каждого хоста
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
        })
        .catch(function(error) {
            console.error("Error fetching data:", error);
        });



});

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

// Функция для получения значения cookie по имени
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        //console.log('Куки 0:', cookies);
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Если имя cookie совпадает с искомым, извлекаем его значение
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    //console.log('Куки 1:', cookieValue);
    return cookieValue;
}

// Функция генерации CSRF токена
function generateCsrfToken() {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var csrfToken = '';
    for (var i = 0; i < 32; i++) {
        csrfToken += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return csrfToken;
}

// Функция для установки CSRF токена в cookies
function setCsrfCookie(name, value) {
    document.cookie = name + '=' + value + ';path=/';
}

