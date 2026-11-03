// Demo: campi form Material (text, select, textarea, checkbox, radio, switch) con validazione
// tramite Reactive Forms tipizzati e la pipe condivisa errorMessage.
import { Component, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ErrorMessagePipe } from '../../../shared/forms/error-message-pipe';
import { ShowcaseSection } from '../../../shared/ui/showcase-section/showcase-section';

const CODE = `form = inject(NonNullableFormBuilder).group({
  email: ['', [Validators.required, Validators.email]],
  role: ['', Validators.required],
  bio: ['', Validators.maxLength(200)],
  plan: ['free'],
  newsletter: [false],
  terms: [false, Validators.requiredTrue],
});

<mat-form-field>
  <mat-label>Email</mat-label>
  <input matInput type="email" formControlName="email" />
  <mat-error>{{ form.controls.email.errors | errorMessage }}</mat-error>
</mat-form-field>

<mat-form-field>
  <mat-label>Role</mat-label>
  <mat-select formControlName="role">
    @for (role of roles; track role) { <mat-option [value]="role">{{ role }}</mat-option> }
  </mat-select>
</mat-form-field>

<mat-radio-group formControlName="plan">
  <mat-radio-button value="free">Free</mat-radio-button>
</mat-radio-group>
<mat-slide-toggle formControlName="newsletter">Newsletter</mat-slide-toggle>
<mat-checkbox formControlName="terms">I accept the terms</mat-checkbox>`;

@Component({
  selector: 'app-form-fields-demo',
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatSlideToggleModule,
    ErrorMessagePipe,
    ShowcaseSection,
  ],
  templateUrl: './form-fields-demo.html',
  styles: `
    .grid {
      display: grid;
      gap: var(--app-space-2) var(--app-space-4);
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }
    .terms-error {
      margin: 0;
      color: var(--mat-sys-error);
      font: var(--mat-sys-body-small);
    }
    pre {
      margin: 0;
      font: 13px/1.5 var(--app-font-mono);
    }
  `,
})
export class FormFieldsDemo {
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly code = CODE;
  protected readonly roles = ['Developer', 'Designer', 'Manager'];
  protected readonly submitted = signal<unknown>(null);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['', Validators.required],
    bio: ['', Validators.maxLength(200)],
    plan: ['free'],
    newsletter: [false],
    terms: [false, Validators.requiredTrue],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.submitted.set(null);
      return;
    }
    this.submitted.set(this.form.getRawValue());
  }
}
