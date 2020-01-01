import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IngresoEgreso } from './ingreso-egreso.model';
import { IngresoEgresoService } from './ingreso-egreso.service';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { AppState } from '../app.reducer';
import { Subscription } from 'rxjs';
import { ActivarLoadingAction, DesactivarLoadingAction } from '../shared/ui.accions';

@Component({
  selector: 'app-ingreso-egreso',
  templateUrl: './ingreso-egreso.component.html',
  styles: []
})
export class IngresoEgresoComponent implements OnInit, OnDestroy {

  forma: FormGroup;
  tipo = null;
  loadingSubscription: Subscription = new Subscription();
  cargando: boolean;

  constructor(public ingresoEgresoService: IngresoEgresoService, private store: Store<AppState>) { }

  ngOnInit() {
    this.store.select('ui').subscribe(ui => {this.cargando = ui.isLoading;})

    this.forma = new FormGroup({
      'descripcion': new FormControl('', Validators.required),
      'monto': new FormControl(0, [Validators.min(1), Validators.required]),
    });
  }

  crearIngresoEgreso() {
    this.store.dispatch(new ActivarLoadingAction());
    const ingresoEgreso = new IngresoEgreso({...this.forma.value, tipo: this.tipo});
    this.ingresoEgresoService.crearIngresoEgreso(ingresoEgreso)
    .then(() => {
      Swal.fire({
        icon: 'success',
        title: ingresoEgreso.descripcion,
        text: `${this.tipo.toUpperCase()} realizado correctamente!`
      });
    })
    .catch(() => {
      Swal.fire({
        icon: 'error',
        title: 'Ha ocurrido un error!',
        text: `El ${this.tipo.toUpperCase()} no se ha llevado a cabo!`
      });
      this.store.dispatch(new DesactivarLoadingAction());
    });
    this.forma.reset({monto: 0});
    this.store.dispatch(new DesactivarLoadingAction());
  }

  ngOnDestroy() {
    this.loadingSubscription.unsubscribe();
  }

}
