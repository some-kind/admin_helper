from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
import os


def parse_hosts(request):
    # Путь к файлу hosts.ini
    file_path = 'D:/Admin_Helper/api/hosts.ini'

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
