import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { IngresoEgreso } from '../ingreso-egreso.model';
import * as fromIngresoEgreso from '../ingreso-egreso.reducer';

@Component({
  selector: 'app-estadistica',
  templateUrl: './estadistica.component.html',
  styles: []
})
export class EstadisticaComponent implements OnInit {

  ingresos: number;
  egresos: number;

  cuantosIngresos: number;
  cuantosEgresos: number;

  subscripcion: Subscription = new Subscription();

  public doughnutChartLabels: string[] = ['Ingresos', 'Egresos'];
  public doughnutChartData: number[] = [];

  constructor(private store: Store<fromIngresoEgreso.AppState>) { }

  ngOnInit() {
    this.subscripcion = this.store.select('ingresoEgreso').subscribe(ingresoEgreso => {
      this.contarIngresosEgresos(ingresoEgreso.items);
    });
  }

  contarIngresosEgresos(items: IngresoEgreso[]) {
    this.ingresos = 0;
    this.egresos = 0;
    this.cuantosEgresos = 0;
    this.cuantosIngresos = 0;

    items.forEach(elem => {
      if(elem.tipo === 'ingreso') {
        this.cuantosIngresos++;
        this.ingresos += elem.monto;
      } else {
        this.cuantosEgresos++;
        this.egresos += elem.monto;
      }
    });

    this.doughnutChartData = [this.ingresos, this.egresos];
  }

}
