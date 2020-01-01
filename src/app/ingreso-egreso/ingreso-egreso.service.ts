import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { IngresoEgreso } from './ingreso-egreso.model';
import { AuthService } from '../auth/auth.service';
import { Store } from '@ngrx/store';
import { AppState } from '../app.reducer';
import { filter, map } from 'rxjs/operators';
import { SetItemsAction, UnsetItemsAction } from './ingreso-egreso.actions';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IngresoEgresoService {

  ingresoEgresoListerSubscription: Subscription = new Subscription();
  ingresoEgresoItemSubscription: Subscription = new Subscription();

  constructor(private afDB: AngularFirestore, public authService: AuthService, private store: Store<AppState>) { }

  crearIngresoEgreso(ingresoEgreso: IngresoEgreso) {
    const usuario = this.authService.getUsuario();
    return this.afDB.doc(`${usuario.uid}/ingresos-egresos`).collection('items').add({...ingresoEgreso});
  }

  initIngresoEgresoListener() {
    this.ingresoEgresoListerSubscription = this.store.select('auth')
    .pipe(filter(auth => auth.user !== null))
    .subscribe(auth => {this.ingresoEgresoItems(auth.user.uid)});
  }

  private ingresoEgresoItems(uid: string) {
    this.ingresoEgresoItemSubscription = this.afDB.collection(`${uid}/ingresos-egresos/items`)
      .snapshotChanges()
      .pipe(
        map(docData => {
          return docData.map(doc => {
            return {
              uid: doc.payload.doc.id,
              ...doc.payload.doc.data()
            };
          });
        })
      )
      .subscribe((coleccion: IngresoEgreso[]) => {
        this.store.dispatch(new SetItemsAction(coleccion));
      });
  }

  borrarIngresoEgreso(item: IngresoEgreso) {
    const usuario = this.authService.getUsuario();
    return this.afDB.doc(`${usuario.uid}/ingresos-egresos/items/${item.uid}`).delete();
  }

  cancelarSubscripciones() {
    this.ingresoEgresoListerSubscription.unsubscribe();
    this.ingresoEgresoItemSubscription.unsubscribe();
    this.store.dispatch(new UnsetItemsAction());
  }

}
