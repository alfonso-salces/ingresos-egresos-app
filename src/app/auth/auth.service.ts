import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as firebase from 'firebase';
import { map } from 'rxjs/operators';
import { User } from './user.model';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private angularFireAuth: AngularFireAuth, 
              private router: Router, 
              private afDB: AngularFirestore) { }

  crearUsuario(nombre: string, email: string, password: string) {
    this.angularFireAuth.auth.createUserWithEmailAndPassword(email, password).then(
      res => {
        const user: User = { uid: res.user.uid, nombre: nombre, email: email};
        this.afDB.doc(`${user.uid}/usuario`).set(user)
        .then(() => {
          this.router.navigate(['/']);
        }).catch();
      }, error => {
        console.error(error);
      }
    ).catch(error => { console.error(error) });
  }

  login(email: string, password: string) {
    this.angularFireAuth.auth.signInWithEmailAndPassword(email, password).then(
      res => {
        Swal.fire({
          icon: 'success',
          title: 'Enhorabuena!',
          text: 'Has iniciado sesión correctamente!'
        });
        this.router.navigate(['/']);
      }, error => {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.message
        })
      }
    ).catch(error => {        
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
    this.angularFireAuth.authState.subscribe((fbUser: firebase.User) => {console.log(fbUser)});
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
