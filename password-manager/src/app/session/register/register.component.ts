import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../models/role';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  message: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    // Definición del formulario reactivo
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

  /**
   * Validación personalizada: Verifica que las contraseñas coincidan.
   */
  passwordsMatch(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  /**
   * Manejo del evento submit del formulario.
   */
  onSubmit() {
    if (this.registerForm.invalid) {
      this.message = 'Por favor corrige los errores del formulario.';
      return;
    }

    this.isLoading = true;

    // Extraemos los valores del formulario
    const { username, telephone, email, password } = this.registerForm.value;

    // Creamos el objeto usuario con rol User por defecto
    const newUser = {
      username,
      password,
      email,
      telephone,
      role: Role.User // Rol siempre será USER
    };

    // Llamamos al servicio AuthService para registrar al usuario
    this.authService.register(newUser).subscribe({
      next: () => {
        this.message = 'Usuario creado exitosamente.';
        this.registerForm.reset();
      },
      error: (err) => {
        console.error('Error al registrar usuario:', err);
        this.message = 'Error al crear el usuario.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
