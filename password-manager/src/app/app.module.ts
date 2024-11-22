import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; 
import { AppComponent } from './app.component';

import { AccountListComponent } from './explore/account-list/account-list.component';
import { AccountService } from './services/account.service';

@NgModule({
  declarations: [
    AppComponent,
    AccountListComponent
  ],
  imports: [ 
    HttpClientModule,
    BrowserModule,
    FormsModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
