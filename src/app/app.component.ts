import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Bienvenido A Angular';
  curso:string = 'Curso de Spring5 con Angular';
  profesor:string = 'Andres Guzman'

}
