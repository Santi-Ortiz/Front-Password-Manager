import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../models/role';
import { HttpClientModule } from '@angular/common/http';
import {NgIf} from "@angular/common"; // Importa HttpClientModule

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    HttpClientModule,
    ReactiveFormsModule,
    NgIf,
    // Asegúrate de incluirlo aquí
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  message: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordsMatch
    });
  }

  passwordsMatch(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }


  onSubmit() {
    if (this.registerForm.invalid) {
      this.message = 'Por favor corrige los errores del formulario.';
      return;
    }

    this.isLoading = true;
    const { username, telephone, email, password } = this.registerForm.value;

    const roleType = Role.User;
    const roleId = roleType === Role.User ? 1 : 2;

    const newUser = {
      username,
      password,
      email,
      telephone,
      role: { id: roleId, rolType: roleType }
    };

    this.authService.register(newUser).subscribe({
      next: () => {
        this.message = 'Usuario creado exitosamente.';
        this.registerForm.reset();
      },
      error: (err) => {
        // Manejar errores específicos
        if (err.error.message.includes('ya está en uso')) {
          this.message = 'El usuario o correo ya existe.';
        } else {
          this.message = 'Error al crear el usuario.';
        }
        console.error('Error al registrar usuario:', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }


}
