# Используем образ Debian
FROM debian:latest

# Обновляем пакеты и устанавливаем необходимые зависимости
RUN apt-get update && apt-get install -y \
    software-properties-common \
    && apt-get install -y ansible sshpass python3 \
    && pip3 install django

# Убеждаемся, что локали нет (для избежания проблем с кодировкой)
ENV LANG C.UTF-8

# Устанавливаем рабочую директорию по умолчанию
WORKDIR /ansible

# По желанию можно добавить другие инструкции, например, копирование ролей, инвентаря и т.д.


# Просто оставляем контейнер запущенным
#CMD tail -f /dev/null

# подтягивание зависимостей
CMD ["sh", "-c", "ansible-galaxy install -r /ansible/requirements.yml \
 && ansible-galaxy collection install -r /ansible/requirements.yml \
 && tail -f /dev/null"]