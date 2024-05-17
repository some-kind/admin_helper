// Функция для переключения темы
function toggleTheme() {
    var body = document.body;
    var isDarkMode = body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

    // Обновление иконки
    var themeIcon = document.getElementById('theme-icon');
    themeIcon.classList.toggle('fa-sun', !isDarkMode);
    themeIcon.classList.toggle('fa-moon', isDarkMode);
}

// Функция для применения темы при загрузке страницы
function applyTheme() {
    var savedTheme = localStorage.getItem('theme');
    var isDarkMode = savedTheme === 'dark';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }

    // Обновление иконки при загрузке
    var themeIcon = document.getElementById('theme-icon');
    themeIcon.classList.toggle('fa-sun', !isDarkMode);
    themeIcon.classList.toggle('fa-moon', isDarkMode);
}

// Добавление обработчика событий для кнопки переключения темы
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

// Применение темы при загрузке страницы
applyTheme();