import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../homeService/cart';
import { ProductService } from '../homeService/produit';
import { MaterielService } from '../homeService/materiel';
import { AromeService } from '../homeService/arome';
import { BaseService } from '../homeService/base';
import { DiverService } from '../homeService/diver';
import { PackService } from '../homeService/pack';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {

  saveurs = [
    { id: 1, name: 'Classic' },
    { id: 2, name: 'Mentholé' },
    { id: 3, name: 'Fruité' },
    { id: 4, name: 'Boisson' },
    { id: 5, name: 'Gourmand' },
    { id: 6, name: 'Boosters/Additifs' }
  ];

  types = [
    { id: 1, name: 'Kit' },
    { id: 2, name: 'Pod' },
    { id: 3, name: 'Box' },
    { id: 4, name: 'Clearomiseurs/Atomiseurs' },
    { id: 5, name: 'Consomables' }
  ];

  diys = [
    { name: 'Bases', route:'diy/bases' },
    { name: 'Arômes concentré', route:'diy/aromes' },
    { name: 'Booster/Additifs', route:'diy/boosters_additifs' },
    { name: 'Packs', route:'diy/packs' },
    { name: 'Divers', route:'diy/divers' },
  ];

  isMobileMenuOpen = false;
  isProductSubmenuOpen = false;
  isMaterielSubmenuOpen = false;
  isDiySubmenuOpen = false;

  cartCount = 0;

  showSearchPopup = false;

  searchTerm = '';

  searchResults: any[] = [];

  produits: any[] = [];

  materiels: any[] = [];

  aromes: any[] = [];

  bases: any[] = [];

  dicers: any[] = [];

  packs: any[] = [];

  private cartSub = new Subscription();
  private dataSub = new Subscription();

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private materielService: MaterielService,
    private aromeService: AromeService,
    private baseService: BaseService,
    private diverService: DiverService,
    private packService: PackService,
    private router: Router
  ) {}


  ngOnInit(): void {

    this.cartSub.add(
      this.cartService.cart$.subscribe(items => {

        this.cartCount = items.reduce(
          (total, item) => total + item.quantity,
          0
        );

      })
    );

    // Charger les produits
    this.dataSub.add(
      this.productService.getProducts().subscribe({

        next: (products) => {

          this.produits = products;

          console.log(
            'Produits disponibles pour la recherche:',
            this.produits
          );

        },

        error: (error) => {

          console.error(
            'Erreur lors du chargement des produits:',
            error
          );

        }

      })
    );


    // -------------------------------
    // CHARGER LES MATÉRIELS
    // -------------------------------

    this.dataSub.add(
      this.materielService.getMateriels().subscribe({

        next: (materiels) => {

          this.materiels = materiels;

          console.log(
            'Matériels disponibles pour la recherche:',
            this.materiels
          );

        },

        error: (error) => {

          console.error(
            'Erreur lors du chargement des matériels:',
            error
          );

        }

      })
    );

    // -------------------------------
    // CHARGER LES ARÔMES
    // -------------------------------
    this.dataSub.add(
      this.aromeService.getAromes().subscribe({

        next: (aromes) => {
          this.aromes = aromes;

          console.log(
            'Arômes:',
            this.aromes
          );
        },

        error: err => {
          console.error('Erreur arômes:', err);
        }

      })
    );

    // -------------------------------
    // CHARGER LES BASES
    // -------------------------------
    this.dataSub.add(
      this.baseService.getBases().subscribe({

        next: (bases) => {
          this.bases = bases;

          console.log(
            'Bases:',
            this.bases
          );
        },

        error: err => {
          console.error('Erreur bases:', err);
        }

      })
    );

    // -------------------------------
    // CHARGER LES PACKS
    // -------------------------------
    this.dataSub.add(
      this.packService.getPacks().subscribe({

        next: (packs) => {
          this.packs = packs;

          console.log(
            'Packs:',
            this.packs
          );
        },

        error: err => {
          console.error('Erreur packs:', err);
        }

      })
    );

    // -------------------------------
    // CHARGER LES DIVERS
    // -------------------------------
    this.dataSub.add(
      this.diverService.getDivers().subscribe({

        next: (divers) => {
          this.dicers = divers;

          console.log(
            'Divers:',
            this.dicers
          );
        },

        error: err => {
          console.error('Erreur divers:', err);
        }

      })
    );

  }

  ngOnDestroy(): void {
    this.cartSub.unsubscribe();
    this.dataSub.unsubscribe();
  }

  toggleMobileMenu(): void {

    this.isMobileMenuOpen = !this.isMobileMenuOpen;

    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    if (!this.isMobileMenuOpen) {
      this.isProductSubmenuOpen = false;
      this.isMaterielSubmenuOpen = false;
      this.isDiySubmenuOpen = false;

    }

  }

  closeAllMenus(): void {

    this.isMobileMenuOpen = false;
    this.isProductSubmenuOpen = false;
    this.isMaterielSubmenuOpen = false;
    this.isDiySubmenuOpen = false;

    document.body.style.overflow = ''
  }

  toggleProductSubmenu(): void {

    this.isProductSubmenuOpen = !this.isProductSubmenuOpen;

    if (this.isProductSubmenuOpen) {
      this.isMaterielSubmenuOpen = false;
      this.isDiySubmenuOpen = false;
    }

  }

  toggleMaterielSubmenu(): void {

    this.isMaterielSubmenuOpen = !this.isMaterielSubmenuOpen;

    if (this.isMaterielSubmenuOpen) {
      this.isProductSubmenuOpen = false;
      this.isDiySubmenuOpen = false;
    }

  }

  toggleDiySubmenu(): void {

    this.isDiySubmenuOpen = !this.isDiySubmenuOpen;

    if (this.isDiySubmenuOpen) {
      this.isProductSubmenuOpen = false;
      this.isMaterielSubmenuOpen = false;
    }

  }

  filtrerParSaveur(saveur: {id:number, name:string}): void {

    console.log('saveur cliquée:', saveur);

    this.closeAllMenus();

    if (saveur.id === 6) {
      this.router.navigate(['/diy/boosters_additifs']);
      return;
    }
    
    this.router.navigate(['/produits'], {
      queryParams: {
        saveur: saveur.id
      }
    });

  }

  filtrerParType(type: {id:number, name:string}): void {

    console.log('type cliqué:', type.id);

    this.closeAllMenus();

    this.router.navigate(['/materiels'], {
      queryParams: {
        type: type.id
      }
    });

  }

  goToProduits(): void {

    this.router.navigate(['/produits'], {
      queryParams: {}
    })
    .then(() => {
      this.closeAllMenus();
    });

  }

  goToMateriels(): void {

    this.router.navigate(['/materiels'], {
      queryParams: {}
    })
    .then(() => {
      this.closeAllMenus();
    });

  }

  openSearchPopup(): void {

    this.showSearchPopup = true;

    this.searchTerm = '';

    this.searchResults = [];

    document.body.style.overflow = 'hidden';

  }

  closeSearchPopup(): void {

    this.showSearchPopup = false;

    this.searchTerm = '';

    this.searchResults = [];

    document.body.style.overflow = '';

  }

  onSearch(): void {

    const search = this.searchTerm
      .trim()
      .toLowerCase();


    // Si la recherche est vide
    if (!search) {

      this.searchResults = [];

      return;

    }

    const results: any[] = [];


    // ========================================
    // RECHERCHE PRODUITS
    // UNIQUEMENT DANS LE NOM
    // ========================================

    this.produits.forEach(produit => {

      const nomProduit = String(
        produit.nom || ''
      ).toLowerCase();


      if (nomProduit.includes(search)) {

        results.push({

          id: produit.id,

          name: produit.nom,

          image: produit.image,

          price: produit.prix,

          category: 'E-liquide',

          route: '/produits',

          original: produit

        });

      }

    });


    // ========================================
    // RECHERCHE MATÉRIELS
    // DANS LE NOM ET LA MARQUE
    // ========================================

    this.materiels.forEach(materiel => {

      const nomMateriel = String(
        materiel.nom || ''
      ).toLowerCase();
    
      const marqueMateriel = String(
        materiel.marque || ''
      ).toLowerCase();
    
      // Recherche dans le nom OU dans la marque
      if (
        nomMateriel.includes(search) ||
        marqueMateriel.includes(search)
      ) {
    
        results.push({
    
          id: materiel.id,
    
          name: materiel.nom,
    
          image: materiel.image,
    
          price: materiel.prix,
    
          // Afficher la marque dans le résultat
          brand: materiel.marque,
    
          category: 'E-cigarette',
    
          route: '/materiels',
    
          original: materiel
    
        });
    
      }    

    });


    // ========================================
    // RECHERCHE CATÉGORIES DIY
    // UNIQUEMENT DANS LE NOM
    // ========================================

    // arome
    this.aromes.forEach(arome => {

      const nomArome = String(
        arome.nom || ''
      ).toLowerCase();
    
      const marqueArome = String(
        arome.marque || ''
      ).toLowerCase();
    
    
      // Recherche dans le nom OU dans la marque
      if (
        nomArome.includes(search) ||
        marqueArome.includes(search)
      ) {
    
        results.push({
    
          id: arome.id,
    
          name: arome.nom,
    
          image: arome.image,
    
          price: arome.prix,
    
          // Afficher la marque dans le résultat
          brand: arome.marque,
    
          category: 'arome',
    
          route: '/diy/aromes',
    
          original: arome
    
        });
    
      }    

    });
    
    // base
    this.bases.forEach(base => {

      const nom = String(base.nom || '').toLowerCase();
    
      if (nom.includes(search)) {
    
        results.push({
    
          id: base.id,
          name: base.nom,
          image: base.image,
          price: base.prix,
          category: 'base',
          route: '/diy/bases',
          original: base
    
        });
    
      }
    
    });

    // divers
    this.dicers.forEach(diver => {

      const nom = String(diver.nom || '').toLowerCase();
    
      if (nom.includes(search)) {
    
        results.push({
    
          id: diver.id,
          name: diver.nom,
          image: diver.image,
          price: diver.prix,
          category: 'divers',
          route: '/diy/divers',
          original: diver
    
        });
    
      }
    
    });

    // packs
    this.packs.forEach(pack => {

      const nom = String(pack.nom || '').toLowerCase();
    
      if (nom.includes(search)) {
    
        results.push({
    
          id: pack.id,
          name: pack.nom,
          image: pack.image,
          price: pack.prix,
          category: 'pack',
          route: '/diy/packs',
          original: pack
    
        });
    
      }
    
    });

    // ========================================
    // STOCKER LES RÉSULTATS
    // ========================================

    this.searchResults = results;

  }

  goToSearchResult(result: any): void {
  
    // Sauvegarder la recherche avant de fermer le popup
    const recherche = this.searchTerm.trim();
  
    this.closeSearchPopup();
  
    // ==============================
    // PRODUIT
    // ==============================
    if (result.category === 'E-liquide') {
  
      this.router.navigate(['/produits'], {
        queryParams: {
          recherche: recherche
        }
      });
  
      return;
    }
  
  
    // ==============================
    // MATÉRIEL
    // ==============================
    if (result.category === 'E-cigarette') {
  
      this.router.navigate(['/materiels'], {
        queryParams: {
          recherche: recherche
        }
      });
  
      return;
    }
  
  
    // ==============================
    // DIY
    // ==============================
    if (result.category === 'arome') {
  
      this.router.navigate(['/diy/aromes'], {
        queryParams: {
          recherche: recherche
        }
      });
  
      return;
    }
  
    if (result.category === 'base') {

      this.router.navigate(['/diy/bases'], {
        queryParams: { recherche }
      });
    
      return;
    }
    
    
    if (result.category === 'pack') {
    
      this.router.navigate(['/diy/packs'], {
        queryParams: { recherche }
      });
    
      return;
    }
    
    
    if (result.category === 'divers') {
    
      this.router.navigate(['/diy/divers'], {
        queryParams: { recherche }
      });
    
      return;
    }
  }
}