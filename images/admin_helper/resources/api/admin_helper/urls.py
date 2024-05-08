from django.urls import path
from . import views

urlpatterns = [
    path('get_hosts/', views.get_hosts, name='parse_hosts'),
    path('delete_host/', views.delete_host, name='delete_host'),
    path('add_host/', views.add_host, name='add_host'),
    path('get_settings/', views.get_settings, name='get_settings'),
]
