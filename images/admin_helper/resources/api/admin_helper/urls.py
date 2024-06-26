from django.urls import path
from . import views

urlpatterns = [
    path('get_hosts/', views.get_hosts, name='parse_hosts'),
    path('delete_host/', views.delete_host, name='delete_host'),
    path('add_host/', views.add_host, name='add_host'),
    path('get_settings/', views.get_settings, name='get_settings'),
    path('change_var/', views.change_var, name='change_var'),
    path('run_ansible_playbook/', views.run_ansible_playbook, name='run_ansible_playbook'),
]
