import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './home/home';
import { Contact } from './contact/contact';
import { NotFoundComponent } from './not-found/not-found'
import { LayoutAdmin } from './components/layout/layout';

import { Dashboard } from './components/dashboard/dashboard';
import { ProduitComponent } from './components/produit/produit';
import { MaterielComponent } from './components/materiel/materiel';
import { UtilisateurComponent } from './components/utilisateur/utilisateur';

import { LayoutClient } from './layout/layout';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    {
        path: 'admin', 
        component: LayoutAdmin,
        canActivate: [authGuard],
        children:[
            { path:'dashboard', component:Dashboard },
            { path:'produits', component:ProduitComponent },
            { path:'materiels', component:MaterielComponent },
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
    { path:'**', component:NotFoundComponent }
];
