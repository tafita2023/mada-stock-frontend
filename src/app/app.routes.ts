import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './home/home';

import { Layout } from './components/layout/layout';
import { ProduitComponent } from './components/produit/produit';
import { Dashboard } from './components/dashboard/dashboard';

export const routes: Routes = [
    {
        path: '', 
        component: Layout, 
        children:[
            { path:'', component:Home },
            { path:'login', component:Login  },
            { path:'dashboard', component:Dashboard },
            { path:'produits', component:ProduitComponent }
    
        ]
    }
];
