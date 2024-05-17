// Инициализация AnsiUp
var ansi_up = new AnsiUp();

// Функция для обновления текста в элементе textarea
function updateLogText(logText) {
    var logTextArea = document.getElementById('logTextArea');
    // logTextArea.value += logText + '\n';
    // Прокрутка вниз при добавлении новых логов
    // logTextArea.scrollTop = logTextArea.scrollHeight;

    // Вывод логов в консоль для проверки
    //console.log("Original log text:", logText);

    var htmlText = ansi_up.ansi_to_html(logText);  // Преобразование ANSI в HTML

    // Вывод преобразованных логов в консоль для проверки
    // console.log("HTML log text:", htmlText);

    // Добавление новых строк с логами
    logTextArea.innerHTML += htmlText + '<br>';

    // Прокрутка вниз при добавлении новых логов
    logTextArea.scrollTop = logTextArea.scrollHeight;
}

// Функция для отправки GET запроса на запуск плейбука и получение логов
function fetchLogs(playbookName) {
    var eventSource = new EventSource('/api/run_ansible_playbook/?playbook_name=' + playbookName);
    eventSource.onmessage = function(event) {
        var logText = event.data;
        updateLogText(logText);
    };
    eventSource.onerror = function(event) {
        if (event.eventPhase === EventSource.CLOSED) {
            console.log('Выполнение плейбука завершено');
        } else {
            console.error('Error occurred:', event);
        }
        eventSource.close();
    };
}
