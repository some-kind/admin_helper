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

        // Добавление блока для формы ввода нового хоста
        var addHostForm = document.createElement("div");
        addHostForm.className = "add-host-form";
        addHostForm.innerHTML = "<input class='host_name' type=text name='host_name' placeholder='Введите имя нового хоста'><input class='host_ip' type=text name='host_ip' placeholder='Введите IP нового хоста'><button class='btn add-host-form-btn'>Добавить</button><button class='btn close-form-btn'>Отмена</button>";
        hostsManager.appendChild(addHostForm);

        // Добавление кнопки "Добавить хост"
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

// Функция для обработки нажатия на кнопку Добавить хост (появление формы и скрытие кнопки)
function toggleAddHost(event) {
    var formDiv = event.target.previousElementSibling;
    if (formDiv && formDiv.classList.contains("add-host-form")) {
        formDiv.classList.toggle("open");
    }
    else {
        formDiv = event.target.closest(".add-host-form");
        formDiv.classList.toggle("open");
    }

    // Находим саму эту кнопку
    var btnAddHost = event.target.closest(".add-host-btn");
    if (btnAddHost) {
        btnAddHost.classList.toggle("closed");
    }
    else {
        // Находим родительский элемент, содержащий кнопку, на которую нажали
        var groupdiv = event.target.parentElement.parentElement;

        // Находим искомую кнопку по её классу
        var addHostBtn = groupdiv.parentNode.querySelector('.add-host-btn');

        // Добавляем или удаляем класс в зависимости от его наличия
        if (addHostBtn) {
            addHostBtn.classList.toggle("closed");
        }
    }

}
