import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import SignaturePad from 'signature_pad';
import { AutoViatService } from 'src/app/services/auto-viat.service';
import { FirmaService } from 'src/app/services/firma.service';

@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.scss'],
})
export class SignatureComponent  implements OnInit {
  signaturePad!: SignaturePad;
  @Input() tarjetas: any[] = [];
  
  @ViewChild('canvas', {static: true}) signaturePadElement!: ElementRef;
  firma: any;

  constructor(
    private elementRef: ElementRef,
    private modalctrl: ModalController,
    private cdr: ChangeDetectorRef,
    private firmaService: FirmaService,
    private navParams: NavParams,
    private autService : AutoViatService

  ) { 
    // this.tarjeta = this.navParams.get('tarjeta');
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {
    this.signaturePad = new SignaturePad(this.signaturePadElement.nativeElement, {
      penColor: 'rgb(0,0,0)',
      backgroundColor: 'rgb(255,255,255)'
    });
    this.signaturePad.clear();
    this.cdr.detectChanges();
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

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  public ngAfterViewInit() : void{
    this.signaturePad = new SignaturePad(this.signaturePadElement.nativeElement, {
      penColor: 'rgb(0,0,0)',
      backgroundColor: 'rgb(255,255,255)'
    });
    this.signaturePad.clear();
    this.cdr.detectChanges();
  }

  isCanvasBlank(): boolean{
    if(this.signaturePad){
      return this.signaturePad.isEmpty() ? true : false;
    }else{
      return false;
    }
  }

  // SaveSignature(){
  //   // debugger;
  //   const tarjeta = this.navParams.get('tarjeta');
  //   tarjeta.firma = this.firma;
  //   console.log('Firma Shrek');
  //   const dataURL = this.signaturePad.toDataURL('image/png');
  //   console.log(dataURL);
  //   const blob = this.convertBase64toBlob(dataURL);
  //   this.firmaService.guardarFirma(blob);
  //   console.log(blob);
  //   this.modalctrl.dismiss(tarjeta);      
  // }
  SaveSignature(){
    // debugger;

    const dataURL = this.signaturePad.toDataURL('image/png');
    console.log(dataURL);
    const blob = this.convertBase64toBlob(dataURL);
    this.firmaService.guardarFirma(blob);
    console.log('Firma',blob);
    console.log('El array segun: ', this.tarjetas);   

    this.tarjetas.forEach(async tarjeta =>{
      console.log('El folio de la  tarjeta', tarjeta.folio);
      (await this.autService.Auth_Viat(tarjeta, dataURL, '3')).subscribe(
        (response) => {
          console.log('Se ha autorizado un viatico', response);          
        },
        (error) => {
          console.error('Error al autorizar el viático', error);
        }
      )
    });
    this.modalctrl.dismiss();
  }

  convertBase64toBlob(dataURL: any): Blob{
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
  cerrarModal() {
    this.modalctrl.dismiss();
  }

  guardarFirmaEnTarjeta() {
    // Aquí guardas la firma en la tarjeta actual
    this.tarjetas = this.firma;
    // Cierras el modal y pasas la tarjeta actualizada
    this.modalctrl.dismiss(this.tarjetas);
  }
  ngOnViewWillEnter() {
    this.Clear();
  }

}
