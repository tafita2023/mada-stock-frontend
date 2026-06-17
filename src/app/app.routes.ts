import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './home/home';
import { ProductsComponent } from './product/product';
import { MaterielsComponent } from './materiel/materiel';
import { Contact } from './contact/contact';
import { NotFoundComponent } from './not-found/not-found'
import { LayoutAdmin } from './components/layout/layout';

import { Dashboard } from './components/dashboard/dashboard';
import { ProduitComponent } from './components/produit/produit';
import { MaterielComponent } from './components/materiel/materiel';
import { UtilisateurComponent } from './components/utilisateur/utilisateur';
import { CompteComponent } from './components/compte/compte';

import { PanierComponent } from './panier/panier';

import { LayoutClient } from './layout/layout';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    {
        path: 'admin', 
        component: LayoutAdmin,
        canActivate: [authGuard],
        canActivateChild: [authGuard],
        children:[
            { path:'dashboard', component:Dashboard },
            { path:'produits', component:ProduitComponent },
            { path:'materiels', component:MaterielComponent },
            { path:'utilisateurs', component:UtilisateurComponent },
            { path:'mon_compte', component:CompteComponent }

        ]
    },
    {
        path: '',
        component: LayoutClient,
        children: [
            { path:'', component:Home },
            { path:'produits', component:ProductsComponent },
            { path:'materiels', component:MaterielsComponent },
            { path:'contact', component:Contact },
            { path:'panier', component:PanierComponent },        
        ]
    },

    { path:'login', component:Login  },
    { path:'**', component:NotFoundComponent }
];
