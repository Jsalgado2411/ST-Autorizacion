import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-historico',
  templateUrl: './modal-historico.component.html',
  styleUrls: ['./modal-historico.component.scss'],
})
export class ModalHistoricoComponent  implements OnInit {
  
  @Input() tarjeta: any;

  constructor( private modalctrl: ModalController) { }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  cerrarModal() {
    this.modalctrl.dismiss();
  }
}
