import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import Chart from 'chart.js/auto';
import { ProduitService } from '../services/produit';
import { MaterielService } from '../services/materiel';
import { AuthService } from '../services/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit, AfterViewInit {

  totalRevenue = 1000000;
  totalUsers = 2345;
  totalSales = 12543;
  totalProducts = 0;
  totalMateriels = 0;
  totalOrders = 142;
  totalRecept = 10;
  lowStockProducts = 0;

  recentSales: any[] = [];
  topProducts: any[] = [];

  revenueChart: any;
  salesChart: any;

  private dataLoaded = false;

  constructor(
    private produitService: ProduitService,
    private materielService: MaterielService,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  // ======================
  // 1. DATA LOAD (SAFE)
  // ======================
  ngOnInit() {
    if (!this.authService.isLoggedIn()) return;

    this.loadDashboardData();
  }

  loadDashboardData() {
    this.produitService.getProduits().subscribe({
      next: (res: any) => {

        const produits = res.data || res;

        if (!Array.isArray(produits)) return;

        this.totalProducts = produits.length;

        this.lowStockProducts = produits.filter(p => p.stock < 10).length;

        this.topProducts = [...produits]
          .sort((a, b) => b.prix - a.prix)
          .slice(0, 5);

        this.dataLoaded = true;

        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Dashboard error:', err);
      }
    });

    this.materielService.getMateriels().subscribe({
      next: (res: any) => {

        const materiels = res.data || res;

        if (!Array.isArray(materiels)) return;

        this.totalMateriels = materiels.length;

        this.lowStockProducts = materiels.filter(p => p.stock < 10).length;

        this.dataLoaded = true;

        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Dashboard error:', err);
      }
    });

    this.recentSales = [
      { id: 1, customer: 'Jean Dupont', product: 'Produit A', amount: 150, date: '2024-06-03', status: 'completed' },
      { id: 2, customer: 'Marie Martin', product: 'Produit B', amount: 89, date: '2024-06-02', status: 'completed' },
      { id: 3, customer: 'Pierre Durand', product: 'Produit C', amount: 299, date: '2024-06-02', status: 'pending' }
    ];
  }

  // ======================
  // 2. CHARTS SAFE INIT
  // ======================
  ngAfterViewInit() {
    this.waitForDataAndRenderCharts();
  }

  private waitForDataAndRenderCharts() {

    const check = setInterval(() => {

      if (this.dataLoaded) {
        clearInterval(check);
        this.initCharts();
      }

    }, 50);
  }

  initCharts() {

    if (this.revenueChart) this.revenueChart.destroy();
    if (this.salesChart) this.salesChart.destroy();

    this.revenueChart = new Chart('revenueChart', {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
        datasets: [{
          label: 'Revenus',
          data: [12000, 19000, 15000, 25000, 22000, 30000],
          borderColor: '#4f46e5',
          fill: true
        }]
      }
    });

    this.salesChart = new Chart('salesChart', {
      type: 'bar',
      data: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
        datasets: [{
          label: 'Ventes',
          data: [12, 19, 15, 17, 25]
        }]
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'shipped': return 'status-shipped';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Livré';
      case 'pending': return 'En attente';
      case 'shipped': return 'Expédié';
      default: return status;
    }
  }
}