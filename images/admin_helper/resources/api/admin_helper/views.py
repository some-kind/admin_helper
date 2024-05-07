from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
import os

HOSTS = '/ansible/hosts.ini'

# функция при запросе парсит файл hosts.ini и выдаёт ответ в виде json
def parse_hosts(request):
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

                # Находим индекс отправной строки (группа хостов)
                start_index = lines.index(f"[{group}]")

                # Ищем первую пустую строку после отправной строки (конец блока, куда и вставляем новую строку)
                index_insert = None
                for i in range(start_index + 1, len(lines)):
                    if lines[i].strip() == '':
                        index_insert = i
                        break

                # Вставляем строку с хостом
                lines.insert(index_insert, f"{host_name} ansible_host={host_ip}")

                # Перезаписываем файл с новым содержимым
                with open(file_path, 'w', encoding='utf-8') as file:
                    file.writelines(lines)

                return JsonResponse({'status': 'success', 'message': 'Хост успешно удален'})
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': str(e)})
        else:
            return JsonResponse({'status': 'error', 'message': 'Имя хоста или IP не указано'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Метод запроса должен быть POST'})

