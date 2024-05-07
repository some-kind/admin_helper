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

    // Запрос к серверу Django для получения данных о хостах
    fetch("http://10.0.0.123:8000/admin_helper/parse_hosts/")
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            renderHostGroups(data.hosts);
            // Обработчик нажатия на группу для раскрытия
            document.querySelectorAll(".groupHeader").forEach(function(header) {
                header.addEventListener("click", toggleGroup);
            });
        })
        .catch(function(error) {
            console.error("Error fetching data:", error);
        });
});