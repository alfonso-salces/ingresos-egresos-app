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
import { SetUserAction } from './auth.actions';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSubscription: Subscription = new Subscription();

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
          this.router.navigate(['/']);
          this.store.dispatch(new DesactivarLoadingAction());
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
  }

  initAuthListner() {
    this.angularFireAuth.authState.subscribe((fbUser: firebase.User) => {
      if(fbUser) {
        this.userSubscription = this.afDB.doc(`${fbUser.uid}/usuario`).valueChanges().subscribe((usuarioObj: any) => {
          this.store.dispatch(new SetUserAction(new User(usuarioObj)));
        });
      } else {
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

}
