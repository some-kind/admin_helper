# Create your views here.
from django.http import JsonResponse
from django.http import StreamingHttpResponse
from django.http import HttpResponseBadRequest
from django.shortcuts import render

import logging
import re
import os
import subprocess

logger = logging.getLogger(__name__)

HOSTS = '/ansible/hosts.ini'


# функция при запросе парсит файл hosts.ini и выдаёт ответ в виде json
def get_hosts(request):
    # Путь к файлу hosts.ini
    file_path = HOSTS

    # Считывание содержимого файла hosts.ini
    with open(file_path, 'r', encoding='utf-8') as file:
        hosts_content = file.read()

    # Преобразование содержимого файла в список строк
    lines = hosts_content.split('\n')

    # Формирование списка хостов в формате JSON
    hosts = []
    # Переменная для предыдущей строки (нужна для получения комментария)
    prev_line = ''
    for line in lines:
        line = line.strip()
        if line and not line.startswith('#') and 'all:vars' not in line:
            if line.startswith('['):
                try:
                    hosts.append(group_dict)
                except NameError:
                    group_dict = {}
                group = line.strip('[]')
                comment = prev_line.strip('# ')
                group_dict = {'group': group,
                              'comment': comment,
                              'hosts_list': {}}

            # добавление комментария в group_dict как пары 'comment': 'комментарий'

            if 'ansible_host' in line:
                host_data = line.split()
                if len(host_data) >= 2:
                    host_name = host_data[0]
                    host_ip = host_data[-1].split('=')[1]
                    group_dict['hosts_list'].update({host_name: host_ip})

            # TODO добавляем последние данные в файл, если конец файла
            # if line == lines[-1]:
            #     hosts.append(group_dict)

        prev_line = line

    # TODO пофиксить баг hosts.ini с концом файла
    return JsonResponse({'hosts': hosts})


# функция при запросе удаляет строку из файла hosts.ini
def delete_host(request):
    if request.method == 'POST':
        host_name = request.POST.get('host_name')
        if host_name:
            file_path = HOSTS  # путь к файлу hosts.ini
            try:
                # Открываем файл на чтение и считываем его содержимое
                with open(file_path, 'r', encoding='utf-8') as file:
                    lines = file.readlines()

                # Удаляем строку с указанным хостом из списка строк
                new_lines = [line for line in lines if host_name not in line]

                # Перезаписываем файл с новым содержимым
                with open(file_path, 'w', encoding='utf-8') as file:
                    file.writelines(new_lines)

                return JsonResponse({'status': 'success', 'message': 'Хост успешно удален'})
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': str(e)})
        else:
            return JsonResponse({'status': 'error', 'message': 'Имя хоста не указано'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Метод запроса должен быть POST'})


# функция добавления строки в файл hosts.ini при запросе
def add_host(request):
    if request.method == 'POST':
        group = request.POST.get('group')
        host_name = request.POST.get('host_name')
        host_ip = request.POST.get('host_ip')
        if host_name and host_ip:
            file_path = HOSTS
            try:
                # Открываем файл на чтение и считываем его содержимое
                with open(file_path, 'r', encoding='utf-8') as file:
                    lines = file.readlines()

                # отладка
                # logger.debug("Список строк:", lines)

                # Находим индекс отправной строки (группа хостов)
                start_index = lines.index(f"[{group}]\n")

                # Ищем первую пустую строку после отправной строки (конец блока, куда и вставляем новую строку)
                index_insert = None
                for i in range(start_index + 1, len(lines)):
                    if lines[i].strip() == '':
                        index_insert = i
                        break

                # Вставляем строку с хостом
                lines.insert(index_insert, f"{host_name} ansible_host={host_ip}\n")

                # Перезаписываем файл с новым содержимым
                with open(file_path, 'w', encoding='utf-8') as file:
                    file.writelines(lines)

                return JsonResponse({'status': 'success', 'message': 'Хост успешно добавлен'})
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': str(e)})
        else:
            return JsonResponse({'status': 'error', 'message': 'Имя хоста, группы или IP не указано'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Метод запроса должен быть POST'})


# функция при запросе парсит все .yml файлы (плейбуки) и возвращает json
def get_settings(request):
    ansible_directory = "/ansible"
    requirements_file = "requirements.yml"

    result = []
    # парсинг hosts.ini для получения переменных
    hosts_file = HOSTS
    # Считывание содержимого файла hosts.ini
    with open(hosts_file, 'r', encoding='utf-8') as file:
        hosts_content = file.read()

    # Преобразование содержимого файла в список строк
    hosts_lines = hosts_content.split('\n')

    hosts_data = {}
    hosts_data['group'] = 'basic_settings'
    hosts_data['comment'] = 'Основные настройки'
    hosts_data['vars'] = {}

    prev_line = ''  # предыдущая строка, нужна для комментариев
    for line in hosts_lines:
        line = line.strip()
        if line.startswith('[') and 'all:vars' not in line:
            break
        if line.startswith('ansible'):
            var_data = line.split('=')
            var = var_data[0]
            value = var_data[1]
            hosts_data['vars'][var] = {}
            hosts_data['vars'][var]['value'] = value
            hosts_data['vars'][var]['comment'] = prev_line.strip("# ")

        prev_line = line

    # Добавляем словарь основных настроек
    result.append(hosts_data)

    # получаем список файлов в директории ansible и сортируем
    ansible_files = os.listdir(ansible_directory)
    ansible_files.sort()

    # парсинг yml плейбуков
    for filename in ansible_files:
        if filename.endswith(".yml") and filename != requirements_file:
            filepath = os.path.join(ansible_directory, filename)

            filedata = {}
            with open(filepath, 'r') as file:  #, encoding='utf-8'
                lines = file.readlines()

                # Парсинг комментария файла
                file_comment = lines[0].strip("# \n")
                filedata['comment'] = file_comment
                filedata['group'] = filename
                filedata['vars'] = {}

                # Паттерн для поиска переменных и их комментариев
                pattern_var = re.compile(r'^\s{4}(\w+):\s*(.*)$')
                pattern_comment = re.compile(r'^\s*#\s*(.*)$')

                # Флаг для определения, когда заканчивается блок vars
                in_vars_block = False

                # Переменная для хранения текущего комментария
                current_comment = None

                # Парсинг переменных и их комментариев
                for i, line in enumerate(lines[1:]):
                    # line = line.strip()

                    # отладка
                    # logger.debug('Строки: ', lines)
                    # logger.debug('Одна строка: ', line)

                    if line.startswith('  vars:'):
                        in_vars_block = True
                        continue
                    if in_vars_block and line == '':
                        break
                    if in_vars_block:
                        match_var = pattern_var.match(line)
                        match_comment = pattern_comment.match(line)
                        if match_var:
                            var_name = match_var.group(1)
                            var_value = match_var.group(2)

                            var_name.strip()
                            var_value.strip()

                            if var_value == '':
                                for next_line in lines[i+2:]:
                                    if next_line.startswith('      '):
                                        # предыдущий вариант
                                        # var_value += next_line.strip() + '\n'
                                        # новый вариант, убираем именно первые 6 пробелов
                                        var_value += next_line.replace(' ' * 6, '', 1)
                                    else:
                                        break
                                var_value = var_value.strip()

                            if current_comment:
                                filedata['vars'][var_name] = {'comment': current_comment, 'value': var_value}
                                current_comment = None
                            else:
                                filedata['vars'][var_name] = {'comment': "", 'value': var_value}
                        elif match_comment:
                            current_comment = match_comment.group(1)

            result.append(filedata)

    return JsonResponse({'settings': result})


# функция при запросе меняет строку/строки для переменной в файле
def change_var(request):
    if request.method == 'POST':
        filename = request.POST.get('file')

        if filename == "basic_settings":
            filename = "hosts.ini"

        filename = f"/ansible/{filename}"
        varname = request.POST.get('varname')
        value = request.POST.get('value')
        if varname and value:
            try:
                # Открываем файл на чтение и считываем его содержимое
                with open(filename, 'r', encoding='utf-8') as file:
                    lines = file.readlines()

                # Замена в файле hosts.ini
                if filename == "/ansible/hosts.ini":
                    for i, line in enumerate(lines):
                        if line.startswith(f"{varname}="):
                            lines[i] = f"{varname}={value}\n"

                # Замена в плейбуках
                else:
                    # Ищем нужную строку
                    for i, line in enumerate(lines):
                        # Содержимое для поиска
                        search_content = f"    {varname}:"
                        # Паттерн для проверки
                        pattern = re.compile(re.escape(search_content) + r'(?=\s*$)')
                        # Проверка
                        match = pattern.search(line)
                        # Если это многострочная переменная
                        if match:
                            # счётчик удаляемых строк
                            delete_lines_count = 0
                            # Проход по следующим строкам и их замена
                            for k, next_line in enumerate(lines[i + 1:]):

                                if next_line.startswith('      '):
                                    # запоминаем количество удаляемых строк
                                    delete_lines_count += 1
                                else:
                                    # добавляем нужные пробелы в новую строку
                                    value = re.sub(r'\n', r'\n' + ' ' * 6, value)
                                    # сносим ненужные строки
                                    for index in range(delete_lines_count):
                                        del lines[i + 1]
                                    # Вставляем новую строку
                                    lines.insert(i + 1, f"      {value}" + '\n')
                                    break

                        # Если однострочная
                        elif line.startswith(f"    {varname}:"):
                            lines[i] = f"    {varname}: {value}\n"

                # Перезаписываем файл с новым содержимым
                with open(filename, 'w', encoding='utf-8') as file:
                    file.writelines(lines)

                return JsonResponse({'status': 'success', 'message': 'Переменная успешно изменена'})
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': str(e)})
        else:
            return JsonResponse({'status': 'error', 'message': 'Параметры не указаны'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Метод запроса должен быть POST'})


# функция формирования динамического SSE ответа для логов работы плейбука
def stream_logs(process):
    while process.poll() is None:
        output = process.stdout.readline().decode().strip()
        if output:
            yield 'data: {}\n\n'.format(output)
    remaining_output = process.communicate()[0].decode().strip()
    if remaining_output:
        yield 'data: {}\n\n'.format(remaining_output)


# функция при запросе выполняет плейбук и динамически отправляет логи в ответ
def run_ansible_playbook(request):
    if request.method == 'GET':
        playbook_name = request.GET.get('playbook_name')
        if playbook_name is None:
            return HttpResponseBadRequest("Не указан параметр playbook_name")
        # playbook_path = f"/ansible/{playbook_name}"

        # Команда
        command = 'cd /ansible && ansible-playbook {}'.format(playbook_name)

        process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

        response = StreamingHttpResponse(stream_logs(process), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['Connection'] = 'keep-alive'

        return response
