import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { BiometryType, NativeBiometric } from 'capacitor-native-biometric';
import { STApiService } from 'src/app/services/stapi.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  server = 'https://supertrack-net.dynns.com';
  isToast = false;
  toastMessage!: string;

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  })

  constructor(
              private apiService : STApiService, 
              private loadingCtrl : LoadingController,
              private toastCtrl: ToastController,
              private router: Router) { }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {
  }

  async submit() {
    const email = this.form.get('email')!.value;
    const password = this.form.get('password')!.value;
    // Verificar que email y password no sean null antes de llamar a la función
    if (email !== null && password !== null) {
      
      const loading = await this.loadingCtrl.create({
        message: 'Cargando...',
        spinner: 'crescent',
        duration: 3000,
      });

      await loading.present();

      (await this.apiService.login(email, password)).subscribe(
        (resp: any) => {
          if(resp.message === 'Usuario Correcto'){
            this.router.navigate(['/tabs/index']);
          } else {
            this.presentToast('Correo o contraseña incorrectos');
          }
        }, 
        (error: any) => {
          console.error('El error es: ', error);
          this.presentToast('Ocurrió un error. Inténtalo de nuevo');
        }
      );
    } else {
      console.error('El email o la contraseña son null.');
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 5000,
      position: 'bottom',
      color: 'danger',
    });
    toast.present();
  }

  
  async performBiometricVerification() {
    try {
      const result = await NativeBiometric.isAvailable({ useFallback: true });
      if (!result.isAvailable) {
        this.presentToast('No se encuentra autenticación biométrica disponible en el dispositivo');
        return;
      }
  
      const isFaceID = result.biometryType == BiometryType.FACE_ID;
      const HuellaID = result.biometryType == BiometryType.FINGERPRINT;

      console.log('Tienes:', isFaceID);
      console.log('Tienes: ', HuellaID);

      await NativeBiometric.verifyIdentity({
        reason: "Autenticación",
        title: "Log in",
        subtitle: isFaceID ? "Face ID" : (HuellaID ? "Touch ID" : "Autenticación biométrica"), // Fallback a "Autenticación biométrica" si no es ni Face ID ni Touch ID
        description: "Tu " + (isFaceID ? "Face ID" : "Touch ID") + " necesita autorización",
        useFallback: true,
        maxAttempts: 2,
      });
  
      this.submit();
    } catch (error) {
      console.error(error);
      this.presentToast('Autenticación biométrica fallida');
    }
  }
}