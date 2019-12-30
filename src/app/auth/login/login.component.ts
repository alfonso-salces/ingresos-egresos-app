import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {

  errormsg;

  constructor(public authService: AuthService) { }

  ngOnInit() {
  }

  onSubmit(formulario) {
    this.authService.login(formulario.email, formulario.password);
  }

}
