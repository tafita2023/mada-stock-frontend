import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './home/home';

import { Layout } from './components/layout/layout';
import { ProduitComponent } from './components/produit/produit';
import { Dashboard } from './components/dashboard/dashboard';
import { UtilisateurComponent } from './components/utilisateur/utilisateur';

export const routes: Routes = [
    {
        path: 'admin', 
        component: Layout, 
        children:[
            { path:'dashboard', component:Dashboard },
            { path:'produits', component:ProduitComponent },
            { path:'utilisateurs', component:UtilisateurComponent }
        ]
    },
    { path:'', component:Home },
    { path:'login', component:Login  },

];
