import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService {


  // Filtre sélectionné
  private saveurSubject = new BehaviorSubject<string>('');
  saveur$ = this.saveurSubject.asObservable();


  private typeSubject = new BehaviorSubject<number>(0);
  type$ = this.typeSubject.asObservable();



  // Liste des saveurs pour le navbar
  private saveursSubject = new BehaviorSubject<string[]>([
    'Classic',
    'Mentholé',
    'Fruité',
    'Boisson',
    'Gourmand'
  ]);

  saveurs$ = this.saveursSubject.asObservable();



  // Liste des types pour le navbar
  private typesSubject = new BehaviorSubject<number[]>([
    1,
    2,
    3,
    4,
    5,
    6
  ]);

  types$ = this.typesSubject.asObservable();



  setSaveur(saveur: string) {
    this.saveurSubject.next(saveur);
  }


  setType(type: number) {
    this.typeSubject.next(type);
  }


  setSaveurs(saveurs: string[]) {
    this.saveursSubject.next(saveurs);
  }


  setTypes(types: number[]) {
    this.typesSubject.next(types);
  }

}