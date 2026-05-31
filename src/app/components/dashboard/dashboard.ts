import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports:[CommonModule]
})
export class Dashboard {
  // Statistiques
  totalRevenue = '45 231 €';
  totalUsers = '2 345';
  totalSales = '12 543';

  // Projets récents
  projects = [
    {
      icon: '📱',
      name: 'Application Mobile',
      description: 'Développement d\'une app cross-platform',
      progress: 75
    },
    {
      icon: '🛒',
      name: 'Site E-commerce',
      description: 'Refonte du site de vente en ligne',
      progress: 45
    },
    {
      icon: '📊',
      name: 'Dashboard Analytics',
      description: 'Système de reporting',
      progress: 90
    }
  ];

  // Activités récentes
  activities = [
    {
      avatar: '👤',
      user: 'Marie Martin',
      action: 'a créé un nouveau projet',
      time: 'Il y a 5 minutes',
      status: 'success'
    },
    {
      avatar: '📝',
      user: 'Pierre Dubois',
      action: 'a modifié un document',
      time: 'Il y a 1 heure',
      status: 'warning'
    },
    {
      avatar: '💬',
      user: 'Sophie Bernard',
      action: 'a commenté sur le projet',
      time: 'Il y a 3 heures',
      status: 'info'
    },
    {
      avatar: '✅',
      user: 'Thomas Robert',
      action: 'a complété une tâche',
      time: 'Il y a 5 heures',
      status: 'success'
    }
  ];
}