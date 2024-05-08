# Create your views here.
from django.http import JsonResponse
from django.shortcuts import render

import logging
import re
import os

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

        prev_line = line

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

    result = {}
    for filename in os.listdir(ansible_directory):
        if filename.endswith(".yml") and filename != requirements_file:
            filepath = os.path.join(ansible_directory, filename)

            filedata = {}
            with open(filepath, 'r') as file:  #, encoding='utf-8'
                lines = file.readlines()

                # Парсинг комментария файла
                file_comment = lines[0].strip("# ")
                filedata['comment'] = file_comment

                # Паттерн для поиска переменных и их комментариев
                pattern_var = re.compile(r'^\s*(\w+):\s*(.*)$')
                pattern_comment = re.compile(r'^\s*#\s*(.*)$')

                # Флаг для определения, когда заканчивается блок vars
                in_vars_block = False

                # Переменная для хранения текущего комментария
                current_comment = None

                # Парсинг переменных и их комментариев
                for i, line in enumerate(lines[1:]):
                    line = line.strip()

                    # отладка
                    #logger.debug('Строки: ', lines)
                    #logger.debug('Одна строка: ', line)

                    if line.startswith('vars:'):
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

                            if var_value == '':
                                for next_line in lines[i+2:]:
                                    if next_line.startswith('      '):
                                        var_value += next_line.strip() + '\n'
                                    else:
                                        break
                                var_value = var_value.strip()

                            if current_comment:
                                filedata[var_name] = {'comment': current_comment, 'value': var_value}
                                current_comment = None
                            else:
                                filedata[var_name] = {'value': var_value}
                        elif match_comment:
                            current_comment = match_comment.group(1)

            result[filename] = filedata

    return JsonResponse(result)
