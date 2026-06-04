import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './home/home';
import { Contact } from './contact/contact';

import { LayoutAdmin } from './components/layout/layout';
import { ProduitComponent } from './components/produit/produit';
import { Dashboard } from './components/dashboard/dashboard';
import { UtilisateurComponent } from './components/utilisateur/utilisateur';
import { LayoutClient } from './layout/layout';

export const routes: Routes = [
    {
        path: 'admin', 
        component: LayoutAdmin, 
        children:[
            { path:'dashboard', component:Dashboard },
            { path:'produits', component:ProduitComponent },
            { path:'utilisateurs', component:UtilisateurComponent }
        ]
    },
    {
        path: '',
        component: LayoutClient,
        children: [
            { path:'', component:Home },
            { path:'contact', component:Contact },        
        ]
    },

    { path:'login', component:Login  },

];
