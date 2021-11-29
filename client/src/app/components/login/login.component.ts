import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    public authService: AuthService
  ) { }

  ngOnInit() { }

  public signIn(email: string, password: string): void{
    this.authService.signIn(email, password);
  }

  public signOut(){
    this.authService.signOut();
  }

  public googleAuth(): Promise<void>{
    return this.authService.googleAuth();
  }
}
