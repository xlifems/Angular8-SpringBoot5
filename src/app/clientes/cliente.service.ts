import { Injectable } from '@angular/core';
// Para formatear y trabajar con fechas
import { formatDate, DatePipe } from '@angular/common';
import localeES from '@angular/common/locales/es';

import { Cliente } from './cliente';
import { CLIENTES } from "./clientes.json";

import { of, Observable, throwError } from "rxjs";
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent } from "@angular/common/http";
import { map, catchError, tap } from "rxjs/operators";
import Swal from 'sweetalert2';

import { Router } from "@angular/router";
import { Region } from './region';
import { AuthService } from '../usuarios/auth.service';



@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  private endPoint: string = 'http://localhost:8080/api/clientes';

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) { }

  // Ya no utilizaremos este metodo para agregar cabeceras, lo hacemosen el interceptor
  private agregarAuthorizationHeader() {
    let token = this.authService.token;
    if (token != null) {
      return this.httpHeaders.append('Authorization', 'Bearer ' + token);
    }
    return this.httpHeaders;
  }

  private isNotAutorizado(e): boolean {
    if (e.status == 401) {
      if (this.authService.isAuthenticated()) {
        this.authService.logout();
      }
      this.router.navigate(['/login']);
      return true;
    }
    if ( e.status == 403) {
      Swal.fire('Acceso Denegado', `Hola ${this.authService.usuario.username} no tienes acceso a este recurso`, 'warning');
      this.router.navigate(['/clientes']);
      return true;
    }
    return false;
  }

  getRegiones(): Observable<Region[]> {
    return this.http.get<Region[]>(this.endPoint + '/regiones').pipe(
      catchError(e => {
        this.isNotAutorizado(e);
        return throwError(e);
      })
    );
  }

  getClientes(page: number): Observable<any> {
    //return of(CLIENTES);
    return this.http.get(this.endPoint + '/page/' + page).pipe(
      map((response: any) => {
        (response.content as Cliente[])
          .map(cliente => {
            cliente.nombre = cliente.nombre.toUpperCase();
            let datePipe = new DatePipe('es');
            //cliente.createAt = formatDate(cliente.createAt, 'dd-mm-yyyy', 'en-US');
            //cliente.createAt = datePipe.transform(cliente.createAt, 'EEEE dd, MMMM yyyy');
            return cliente;
          });
        return response;
      }), tap((response: any) => {
        let clientes = (response.content as Cliente[])
        clientes.forEach(element => {
          console.log("tap 1: ", element);
        });

      })
    );
  }

  /**
   * map() permite obtener y mapear a gusto el resultado del on¿bservador
   * en este caso la respuesta del observado es mapeado a una lista de objetos clientes 
   */
  getClientesWithMap(): Observable<Cliente[]> {
    //return of(CLIENTES);
    return this.http.get(this.endPoint).pipe(
      map(response => response as Cliente[])
    );
  }

  /**
   * En esta funcion se retorna un observable de tipo cliente, pero para ello el response del 
   * servicio tiene que ser parseado a traves del operador map puesro que dicha respuesta es un json
   * con varios onjetos, en donde de ellos solo se extrae el que corresponde a cliente
   * @param cliente 
   */
  create(cliente: Cliente): Observable<Cliente> {
    console.log(cliente);
    return this.http.post(this.endPoint, cliente).pipe(
      map((response: any) => response.cliente as Cliente),
      catchError(e => {

        if (this.isNotAutorizado(e)) {
          return throwError(e)
        }

        if (e.status == 400) {
          return throwError(e);
        }
        console.error(e.error.mensaje);
        Swal.fire('Error al crear cliente!', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  getCliente(id): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.endPoint}/${id}`).pipe(
      catchError(e => {

        if (this.isNotAutorizado(e)) {
          return throwError(e)
        }

        this.router.navigate(['/clientes']);
        console.error(e.error.mensaje);
        Swal.fire('Error!', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  /**
  * En esta funcion se retorna un observable de tipo any, puesto que dicha respuesta es un json
  * con varios onjetos, en donde la funcion que invoque a esta, debe extraer el que corresponda a cliente 
  * y esperar de igual forma un tipo any como respuesta.
  * @param cliente 
  */
  updateCliente(cliente: Cliente): Observable<any> {
    console.log(cliente);
    return this.http.put<any>(`${this.endPoint}/${cliente.id}`, cliente).pipe(
      catchError(e => {

        if (this.isNotAutorizado(e)) {
          return throwError(e)
        }

        if (e.status == 400) {
          return throwError(e);
        }
        console.error(e.error.mensaje);
        Swal.fire('Error al actualizar cliente!', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  deleteCliente(id: number): Observable<Cliente> {
    return this.http.delete<Cliente>(`${this.endPoint}/${id}`).pipe(
      catchError(e => {

        if (this.isNotAutorizado(e)) {
          return throwError(e)
        }

        console.error(e.error.mensaje);
        Swal.fire('Error al eliminar cliente!', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  subirFoto(archivo: File, id): Observable<HttpEvent<{}>> {
    let formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("id", id);

    /*
    let httpHeaders = new HttpHeaders();
    let token = this.authService.token;
    if (token != null){
      httpHeaders = httpHeaders.append('Authorization', 'Bearer ' + token);
    }
    */

    const req = new HttpRequest('POST', `${this.endPoint}/upload`, formData, {reportProgress: true });

    return this.http.request(req).pipe(
      catchError(e => {
        this.isNotAutorizado(e);
        return throwError(e);
      })
    );
  }
}
