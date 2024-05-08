# Используем образ Debian
FROM debian:latest

# Обновляем пакеты и устанавливаем необходимые зависимости
RUN apt-get update && apt-get install -y \
    software-properties-common \
    && apt-get install -y ansible sshpass python3 python3-pip python3-venv

# Создаем виртуальное окружение и активируем его
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"

# Устанавливаем Django и необходимые зависимости через pip
RUN pip3 install django django-cors-headers gunicorn pyyaml

# Копируем файлы приложения Django
COPY resources/api /app

# Копируем конфиг gunicorn
COPY resources/gunicorn.conf /etc/gunicorn.conf

# Копируем папку ansible
COPY resources/ansible /ansible

# Убеждаемся, что локали нет (для избежания проблем с кодировкой)
ENV LANG C.UTF-8

# устанавливаем зависимости ansible
RUN ansible-galaxy install -r /ansible/requirements.yml \
    && ansible-galaxy collection install -r /ansible/requirements.yml

# Устанавливаем рабочую директорию по умолчанию
WORKDIR /app


# Просто оставляем контейнер запущенным
#CMD tail -f /dev/null

# запуск gunicorn сервера
CMD ["gunicorn", "--config", "/etc/gunicorn.conf", "--bind", "0.0.0.0:8000", "api.wsgi:application"]