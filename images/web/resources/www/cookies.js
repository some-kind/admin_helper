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