import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { ProduitService } from '../services/produit';
import { AuthService } from '../services/auth-service';

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
  totalProducts = 0;
  totalOrders = 0;
  lowStockProducts = 0;

   // Ventes récentes
   recentSales: any[] = [];
  
   // Produits populaires
   topProducts: any[] = [];
   
   // Chart
   revenueChart: any;
   salesChart: any;
   
   constructor(
     private produitService: ProduitService,
     private authService: AuthService
   ) {}
 
   ngOnInit() {
     this.loadDashboardData();
     this.initCharts();
   }
 
   loadDashboardData() {
     // Charger les produits
     this.produitService.getProduits().subscribe((res: any) => {
       const produits = res.data || res;
       
       if (Array.isArray(produits)) {
         // Nombre total de produits
         this.totalProducts = produits.length;
         
         // Revenus totaux (somme des prix * stock)
         this.totalRevenue = produits.reduce((sum, p) => sum + (p.prix * p.stock), 0);
         
         // Produits avec stock bas (< 10)
         this.lowStockProducts = produits.filter(p => p.stock < 10).length;
         
         // Top produits (les plus chers ou les plus vendus)
         this.topProducts = [...produits]
           .sort((a, b) => b.prix - a.prix)
           .slice(0, 5);
       }
     });
          
     // Simuler des commandes
     this.totalOrders = 142;
     
     // Ventes récentes simulées
     this.recentSales = [
       { id: 1, customer: 'Jean Dupont', product: 'Produit A', amount: 150, date: '2024-06-03', status: 'completed' },
       { id: 2, customer: 'Marie Martin', product: 'Produit B', amount: 89, date: '2024-06-02', status: 'completed' },
       { id: 3, customer: 'Pierre Durand', product: 'Produit C', amount: 299, date: '2024-06-02', status: 'pending' },
       { id: 4, customer: 'Sophie Dubois', product: 'Produit D', amount: 45, date: '2024-06-01', status: 'completed' },
       { id: 5, customer: 'Lucas Bernard', product: 'Produit E', amount: 199, date: '2024-06-01', status: 'shipped' }
     ];
   }
 
   initCharts() {
     // Graphique des revenus
     this.revenueChart = new Chart('revenueChart', {
       type: 'line',
       data: {
         labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
         datasets: [{
           label: 'Revenus (€)',
           data: [12000, 19000, 15000, 25000, 22000, 30000],
           borderColor: '#4f46e5',
           backgroundColor: 'rgba(79, 70, 229, 0.1)',
           tension: 0.4,
           fill: true
         }]
       },
       options: {
         responsive: true,
         maintainAspectRatio: false,
         plugins: {
           legend: {
             position: 'top',
           },
           title: {
             display: true,
             text: 'Évolution des revenus'
           }
         }
       }
     });
 
     // Graphique des ventes
     this.salesChart = new Chart('salesChart', {
       type: 'bar',
       data: {
         labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
         datasets: [{
           label: 'Ventes',
           data: [12, 19, 15, 17, 25, 22, 18],
           backgroundColor: '#10b981',
           borderRadius: 8
         }]
       },
       options: {
         responsive: true,
         maintainAspectRatio: false,
         plugins: {
           legend: {
             position: 'top',
           },
           title: {
             display: true,
             text: 'Ventes de la semaine'
           }
         }
       }
     });
   }
 
   getStatusClass(status: string): string {
     switch(status) {
       case 'completed': return 'status-completed';
       case 'pending': return 'status-pending';
       case 'shipped': return 'status-shipped';
       default: return '';
     }
   }
 
   getStatusText(status: string): string {
     switch(status) {
       case 'completed': return 'Livré';
       case 'pending': return 'En attente';
       case 'shipped': return 'Expédié';
       default: return status;
     }
   }
}