import { Injectable, NgZone } from '@angular/core';
import { User } from '../../services/models/user';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: any | null; // Save logged in user data
  user: User = {
    uid: '',
    email: '',
    displayName: '',
    photoURL: '',
    emailVerified: false,
  };
  constructor(
    public firestoreService: AngularFirestore, // Inject Firestore service
    public fireAuthService: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {
    this.fireAuthService.authState.subscribe((user: any) => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user') || '{}');
      } else {
        console.log('in else');
        localStorage.setItem('user', 'null');
        user = JSON.parse(localStorage.getItem('user') || '{}');
      }
    });
  }

  private setUserData(user: User) {
    const userRef: AngularFirestoreDocument<any> = this.firestoreService.doc(
      `users/${user.uid}`
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
    return userRef.set(userData, {
      merge: true,
    });
  }

  private authLogin(provider: any) {
    return this.fireAuthService
      .signInWithPopup(provider)
      .then((result: any) => {
        this.ngZone.run(() => {
          this.router.navigate(['dashboard']);
        });
        this.setUserData(result.user);
      })
      .catch((error: any) => {
        // TODO: create message service
        window.alert(error);
      });
  }

  // Sign in with email/password
  public signIn(email: string, password: string) {
    return this.fireAuthService
      .signInWithEmailAndPassword(email, password)
      .then((result: any) => {
        this.ngZone.run(() => {
          this.router.navigate(['dashboard']);
        });
        this.setUserData(result.user);
      })
      .catch((error: any) => {
        window.alert(error.message);
      });
  }

  public signOut(): Promise<void> {
    return this.fireAuthService.signOut().then(
      () => {
        //TODO: remove all other memories if needed
        localStorage.removeItem('user');
        this.router.navigate(['login']);
      },
      (error) => {
        // TODO: show error
        console.log('error sign out');
      }
    );
  }

  // Sign in with Google
  public googleAuth(): Promise<void> {
    return this.authLogin(new firebase.auth.GoogleAuthProvider());
  }

  // Sign up with email/password
  //
  public signUp(email: string, password: string) {
    return this.fireAuthService
      .createUserWithEmailAndPassword(email, password)
      .then((result: any) => {
        this.sendVerificationMail();
        this.setUserData(result.user);
      })
      .catch((error: any) => {
        window.alert(error.message);
      });
  }

  // // Send email verfificaiton when new user sign up
  private sendVerificationMail(): Promise<any> {
    return this.fireAuthService.currentUser.then(u => u?.sendEmailVerification())
      .then(() => {
        this.router.navigate(['verify-email']);
      }, error =>{
        // TODO: show message
      })
    };

  // // Reset Forggot password
  // ForgotPassword(passwordResetEmail: any) {
  //   return this.afAuth.auth.sendPasswordResetEmail(passwordResetEmail)
  //   .then(() => {
  //     window.alert('Password reset email sent, check your inbox.');
  //   }).catch((error: any) => {
  //     window.alert(error)
  //   })
  // }

  // Returns true when user is looged in and email is verified
  // get isLoggedIn(): boolean {
  //   console.log('in is logged');
  //   const user = JSON.parse(localStorage.getItem('user') || '{}');
  //   return (user !== null && user?.emailVerified !== false) ? true : false;
  // }

  // Auth logic to run auth providers
}
