import * as fromUi from './shared/ui.reducer';
import * as fromAuth from './auth/auth.reducer';
import * as fromIngresoEgreso from './ingreso-egreso/igreso-egreso.reducer';
import { ActionReducerMap } from '@ngrx/store';

export interface AppState {
    ui: fromUi.State;
    auth: fromAuth.AuthState;
    ingresoEgreso: fromIngresoEgreso.IngresoEgresoState;
}

export const appReducers: ActionReducerMap<AppState> = {
    ui: fromUi.uiReducer,
    auth: fromAuth.authReducer,
    ingresoEgreso: fromIngresoEgreso.ingresoEgresoReducer,
};