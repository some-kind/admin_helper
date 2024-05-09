// Функция для отображения групп настроек на основе данных из JSON
function renderSettingsGroups(data) {
    var settingsContainer = document.getElementById("settingsContainer");
    settingsContainer.innerHTML = ''; // Очищаем контейнер перед отображением новых данных

    data.forEach(function(group) {
        var settingDiv = document.createElement("div");
        settingDiv.className = "setting";
        if (group.isOpen) {
            settingDiv.classList.add("open");
        }
        settingDiv.setAttribute("data-setting", group.group);

        var varsList = document.createElement("div");
        varsList.className = "settingList";
        for (var varname in group.vars) {
            if (group.vars.hasOwnProperty(varname)) {
                var varDiv = document.createElement("div");
                varDiv.className = "varDiv";
                varDiv.innerHTML = "<span class='varComment'>" + group.vars[varname]['comment'] + "</span><span class='varName'>" + varname + "</span><span class='varValue'>" + group.vars[varname]['value'] + "</span>";
                varsList.appendChild(varDiv);
            }
        }

        settingDiv.appendChild(varsList);
        settingsContainer.appendChild(settingDiv);
    });
}


// Функция для обновления значений переменных при изменении выбранной настройки
function showSettings(selectedSetting) {

    // Делаем скрытыми все блоки настроек
    var all_settings = document.querySelectorAll(".setting");
    all_settings.forEach(function(settingDiv) {
        settingDiv.classList.add("closed");
    });

    // Ищем выбранный блок и убираем скрытие
    var selectedDiv = document.querySelector("[data-setting='" + selectedSetting + "']");
    selectedDiv.classList.remove('closed');

}