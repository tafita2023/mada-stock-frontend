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
import { BaseComponents } from './diy/base/base';
import { AromeComponent } from './diy/arome/arome';
import { PackComponent } from './diy/pack/pack';
import { DiverComponent } from './diy/diver/diver';
import { CompteComponent } from './components/compte/compte';

import { PanierComponent } from './panier/panier';

import { LayoutClient } from './layout/layout';
import { authGuard } from './guards/auth-guard';
import { BasesComponent } from './components/diy/bases/bases';
import { AromesComponent } from './components/diy/aromes/aromes';
import { PacksComponent } from './components/diy/packs/packs';
import { DiversComponent } from './components/diy/divers/divers';

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
            { path:'mon_compte', component:CompteComponent },
            { path:'diy/bases', component:BasesComponent },
            { path:'diy/aromes', component:AromesComponent },
            { path:'diy/packs', component:PacksComponent },
            { path:'diy/divers', component:DiversComponent }

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
            { path:'diy/bases', component:BaseComponents },
            { path:'diy/aromes', component:AromeComponent },
            { path: 'diy/boosters_additifs', component: ProductsComponent },
            { path:'diy/packs', component:PackComponent },
            { path:'diy/divers', component:DiverComponent }

        ]
    },

    { path:'login', component:Login  },
    { path:'**', component:NotFoundComponent }
];
