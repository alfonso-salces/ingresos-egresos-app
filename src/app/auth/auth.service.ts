import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as firebase from 'firebase';
import { map } from 'rxjs/operators';
import { User } from './user.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { AppState } from '../app.reducer';
import { ActivarLoadingAction, DesactivarLoadingAction } from '../shared/ui.accions';
import { SetUserAction, UnsetUserAction } from './auth.actions';
import { Subscription } from 'rxjs';
import { IngresoEgresoService } from '../ingreso-egreso/ingreso-egreso.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSubscription: Subscription = new Subscription();
  private usuario: User;

  constructor(private angularFireAuth: AngularFireAuth, 
              private router: Router, 
              private afDB: AngularFirestore,
              private store: Store<AppState>) { }

  crearUsuario(nombre: string, email: string, password: string) {

    this.store.dispatch(new ActivarLoadingAction());

    this.angularFireAuth.auth.createUserWithEmailAndPassword(email, password).then(
      res => {
        const user: User = { uid: res.user.uid, nombre: nombre, email: email};
        this.afDB.doc(`${user.uid}/usuario`).set(user)
        .then(() => {
          this.store.dispatch(new DesactivarLoadingAction());
          this.router.navigate(['/']);
        }).catch(() => this.store.dispatch(new DesactivarLoadingAction()));
      }, error => {
        this.store.dispatch(new DesactivarLoadingAction());
        console.error(error);
      }
    ).catch(error => { this.store.dispatch(new DesactivarLoadingAction()); console.error(error) });
  }

  login(email: string, password: string) {

    this.store.dispatch(new ActivarLoadingAction());

    this.angularFireAuth.auth.signInWithEmailAndPassword(email, password).then(
      res => {
        this.store.dispatch(new DesactivarLoadingAction());
        Swal.fire({
          icon: 'success',
          title: 'Enhorabuena!',
          text: 'Has iniciado sesión correctamente!'
        });
        this.router.navigate(['/']);
      }, error => {
        this.store.dispatch(new DesactivarLoadingAction());
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.message
        })
      }
    ).catch(error => {    
      this.store.dispatch(new DesactivarLoadingAction());    
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message
      })
    });
  }

  logout() {
    this.angularFireAuth.auth.signOut();
    this.router.navigate(['/login']);
    this.store.dispatch(new UnsetUserAction());
  }

  initAuthListner() {
    this.angularFireAuth.authState.subscribe((fbUser: firebase.User) => {
      if(fbUser) {
        this.userSubscription = this.afDB.doc(`${fbUser.uid}/usuario`).valueChanges().subscribe((usuarioObj: any) => {
          this.store.dispatch(new SetUserAction(new User(usuarioObj)));
          this.usuario = new User(usuarioObj);
        });
      } else {
        this.usuario = null;
        this.userSubscription.unsubscribe();
      }
    });
  }

  isAuth() {
    return this.angularFireAuth.authState.pipe(
      map(fbUser => {
        if(fbUser == null) {
          this.router.navigate(['/login']);
        }

        return fbUser != null;
      }));
  }

  getUsuario() {
    return {...this.usuario};
  }

}
