from django.urls import path
from . import views

urlpatterns = [
    path('parse_hosts/', views.parse_hosts, name='parse_hosts'),
    path('delete_host/', views.delete_host, name='delete_host')
]
