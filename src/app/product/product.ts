import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product.html',
  styleUrl: './product.css'
})
export class Product {
  // Liste des produits
  products = [
    {
      id: 1,
      name: 'Whisky cola ICE',
      price: 15000,
      volume: '50ml',
      flavor: 'Fruits rouges',
      rating: 4.5,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300&h=300&fit=crop',
      description: 'Un mélange explosif de fruits rouges pour une vape fruitée et rafraîchissante.'
    },
    {
      id: 2,
      name: 'Mystic Red Astaire ICE',
      price: 16000,
      flavor: 'Menthe',
      rating: 4.8,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300&h=300&fit=crop',
      description: 'Une sensation de fraîcheur intense avec un goût de menthe glaciale.'
    },
    {
      id: 3,
      name: 'Lemon cream ICE',
      price: 18000,
      volume: '50ml',
      flavor: 'Citron',
      rating: 4.7,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300&h=300&fit=crop',
      description: 'Un délicieux crème à la vanille pour une vape douce et gourmande.'
    },
    {
      id: 4,
      name: 'Lemon cream',
      price: 17000,
      volume: '50ml',
      flavor: 'Citron',
      rating: 4.3,
      inStock: false,
      image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300&h=300&fit=crop',
      description: 'Le goût authentique du tabac pour une transition en douceur.'
    },
    {
      id: 5,
      name: 'Cookies',
      price: 15500,
      volume: '50ml',
      flavor: 'Cookies',
      rating: 4.9,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300&h=300&fit=crop',
      description: 'Un voyage exotique avec des saveurs de fruits tropicaux.'
    },
    {
      id: 6,
      name: 'Mojito',
      price: 16500,
      volume: '50ml',
      flavor: 'Café',
      rating: 4.6,
      inStock: true,
      image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300&h=300&fit=crop',
      description: 'Le plaisir d\'un bon café en version vape.'
    }
  ];

  // Méthode pour ajouter au panier
  addToCart(product: any) {
    console.log('Produit ajouté au panier:', product);
    // Ajoutez votre logique de panier ici
    alert(`${product.name} ajouté au panier !`);
  }

  // Méthode pour voir les détails du produit
  viewDetails(product: any) {
    console.log('Voir détails:', product);
    // Ajoutez votre logique de navigation ici
  }

  // Obtenir le nombre d'étoiles pour le rating
  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
}