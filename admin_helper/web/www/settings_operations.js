// Функция формирования запроса POST на изменение переменной
function changeVars(nameSetting, varName, varValue) {
    var url = '/api/change_var/';
    //var url = 'http://192.168.0.197:8000/add_host/';

    // Получение CSRF токена из cookies
    var csrftoken = getCookie('csrftoken');

    // console.log('Добавляем хост', hostName, ' ', hostIp, 'в группу:', group);

    // Формируем тело запроса
    var formData = new FormData();
    formData.append('file', nameSetting);
    formData.append('varname', varName);
    formData.append('value', varValue);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('X-CSRFToken', csrftoken); // Установка CSRF токена в заголовок запроса

    xhr.onload = function() {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.status === 'success') {
                console.log('Переменная успешно изменена:', response.message);

            } else {
                console.error('Произошла ошибка:', response.message);
            }
        } else {
            console.error('Произошла ошибка:', xhr.statusText);
        }
    };

    xhr.send(formData);

}