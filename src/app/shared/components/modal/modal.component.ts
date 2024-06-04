import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { STApiService } from 'src/app/services/stapi.service';
import { SignatureComponent } from '../signature/signature.component';
import { FirmaService } from 'src/app/services/firma.service';
import SignaturePad from 'signature_pad';
import { AutoViatService } from 'src/app/services/auto-viat.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent  implements OnInit {

  @Input() tarjeta: any;
  @Input() showSignature!: boolean;
  @ViewChild('canvas', {static: true}) signaturePadElement!: ElementRef;
  signaturePad!: SignaturePad;


  firmaBlob: Blob | null = null;
  firmaURL: string | null = null;
  IndexDatos: any = {};
  ArrayDentro: any = {};

  constructor( private modalctrl: ModalController,
               private stapiservice: STApiService,
               private firmaService: FirmaService,
               private elementRef: ElementRef,
               private cdr: ChangeDetectorRef,
               private autService : AutoViatService
            ) { }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {

    // if(this.showSignature){
    //   this.Firma();
    // }else{
    //   this.cerrarModal();
    // }

    // this.firmaService.firmaBlob$.subscribe(firma => {
    //   this.firmaBlob = firma;
    //   if(firma){
    //     this.firmaURL = URL.createObjectURL(firma);
    //   }
    // });
    this.signaturePad = new SignaturePad(this.signaturePadElement.nativeElement, {
      penColor: 'rgb(0,0,0)',
      backgroundColor: 'rgb(255,255,255)'
    });
    this.signaturePad.clear();
    this.cdr.detectChanges();
    // this.init();
    // this.Firma();
  }

  init(){
    const canvas: any = this.elementRef?.nativeElement.querySelector('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 140;
    console.log(canvas.width, '-', canvas.height);
    if(this.signaturePad){
      this.signaturePad.clear();      
    }
  }
  
  cerrarModal() {
    this.modalctrl.dismiss();
  }

  async Firma() {
    const modal = await this.modalctrl.create({
      component: SignatureComponent,
      componentProps: {
        tarjeta: this.tarjeta
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.tarjeta = result.data;
        this.firmaService.guardarFirma(this.tarjeta.firma);
      }
    });

    return await modal.present();
  }

  
  Cancelar(){
    console.log('Hoy no');
    this.modalctrl.dismiss();    
  }
  async autorizar() {
    // Lógica para autorizar con la firma guardada
    const dataURL = this.signaturePad.toDataURL('image/png');
    console.log(dataURL);
    const blob = this.convertBase64toBlob(dataURL);
    // this.tarjeta.firma = blob; // Asigna la firma al tarjeta
    this.firmaService.guardarFirma(blob);
    console.log('Firma',blob);
    this.modalctrl.dismiss(this.tarjeta);
    try {
        console.log('El array segun arratdatos', this.tarjeta);
        const All_viat = await (await this.autService.Auth_Viat(this.tarjeta, dataURL, '3')).toPromise();
        console.log('Se ha autorizado un viatico', All_viat);
        console.log('Autorizada');
    } catch (error) {
        console.error('Error al autorizar el viático', error);
    }
  }
  
  convertBase64toBlob(dataURL: any): Blob {
    const data = atob(dataURL.substring('data:image/png;base64,'.length)),
        asArray = new Uint8Array(data.length);

    for ( var i = 0, len = data.length; i < len; ++i){
        asArray[i] = data.charCodeAt(i);
    }

    const blob = new Blob([asArray], { type: 'image/png'});
    return blob;
}

  Clear(){
    this.signaturePad.clear();
  }
}
