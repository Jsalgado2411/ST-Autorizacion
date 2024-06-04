import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { tap } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor{
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Agregar el token de autorización al encabezado de la solicitud HTTP
        const token = localStorage.getItem('token');
        if (token) {
            const clonedReq = req.clone({
                headers: req.headers.set('Authorization', 'Bearer ' + token)
            });
            return next.handle(clonedReq).pipe(
                tap(() => {},
                     err => {
                         if (err.status === 401) {
                             // Manejar la situación en la que el token ha expirado o es inválido
                             // Por ejemplo, redirigir al usuario a la página de inicio de sesión
                             console.log('Unauthorized');
                         }
                     }
                 )
            );
        } else {
            return next.handle(req);
        }
    }
}