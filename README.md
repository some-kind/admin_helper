         ╔╗       ╔╗ ╔╗  ╔╗
         ║║       ║║ ║║  ║║ 
    ╔══╦═╝╠╗╔╦╦═╗ ║╚═╝╠══╣║╔══╦══╦═╗ 
    ║╔╗║╔╗║╚╝╠╣╔╗╗║╔═╗║║═╣║║╔╗║║═╣╔╝
    ║╔╗║╚╝║║║║║║║║║║ ║║║═╣╚╣╚╝║║═╣║
    ╚╝╚╩══╩╩╩╩╩╝╚╝╚╝ ╚╩══╩═╣╔═╩══╩╝
                           ║║
                           ╚╝


Данный проект имеет две основные составляющие:
1) контейнер с ansible, сделан для быстрого и независимого разворачивания
2) контейнер с веб-интерфейсом взаимодействия с ansible // в планах

Admin Helper должен упрощать разворачивание базовых сервисов посредством настройки ansible
На данный момент реализовано:
1) Разворачивание СУДБ PostgreSQL на хосте
2) Разворачивание СУБД PostgreSQL в docker контейнере
3) Установка pgAgent на хост (пока только Debian-системы)
4) Разворачивание pgAdmin4 в docker контейнере
5) Установка и настройка прокси и балансировщика Haproxy на хост (пока только Debian-системы)
6) Установка и настройка прокси и балансировщика Haproxy в docker контейнере
7) Разворот связки Prometheus + Grafana для мониторинга
8) Установка агентов Prometheus Node Exporter на хосты (для сбора метрик)

В планах:
1) Разворот мониторинга Zabbix
2) Установка агентов Zabbix Agent на хосты (для сбора метрик)
3) Разворот кластера Redis
4) Разворот кластера Elastic
5) Разворот Kibana, Cerebro, Logstash в связке в эластиком (для сбора и анализа логов)
6) Что ещё придёт в голову