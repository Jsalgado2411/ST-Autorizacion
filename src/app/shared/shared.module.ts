import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { CustomInputComponent } from './components/custom-input/custom-input.component';
import { LogoComponent } from './components/logo/logo.component';
import { TabulacionComponent } from './components/tabulacion/tabulacion.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalComponent } from './components/modal/modal.component';
import { ModalHistoricoComponent } from './components/modal-historico/modal-historico.component';
import { SpinerComponent } from './components/spiner/spiner.component';
import { SignatureComponent } from './components/signature/signature.component';
import { SignatureModalComponent } from './components/signature-modal/signature-modal.component';



@NgModule({
  declarations: [
    HeaderComponent,
    CustomInputComponent,
    LogoComponent,
    TabulacionComponent,
    ModalComponent,
    ModalHistoricoComponent,
    SpinerComponent,
    SignatureComponent,
    SignatureModalComponent
  ],
  exports:[
    HeaderComponent,
    CustomInputComponent,
    LogoComponent,
    TabulacionComponent,
    ReactiveFormsModule,
    ModalComponent,
    ModalHistoricoComponent,
    SpinerComponent,
    SignatureComponent,
    SignatureModalComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class SharedModule { }
