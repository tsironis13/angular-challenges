import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserStore } from './user.service';

@Component({
  selector: 'user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">
      <div>
        Name:
        <input
          class="rounded-md border border-gray-400"
          formControlName="name" />
      </div>
      <div formGroupName="address">
        Address:
        <div>
          street:
          <input
            class="rounded-md border border-gray-400"
            formControlName="street" />
        </div>
        <div>
          zipCode:
          <input
            class="rounded-md border border-gray-400"
            formControlName="zipCode" />
        </div>
        <div>
          city:
          <input
            class="rounded-md border border-gray-400"
            formControlName="city" />
        </div>
      </div>
      <div>
        note:
        <input
          class="rounded-md border border-gray-400"
          formControlName="note" />
      </div>
      <div formGroupName="job">
        <div>
          title:
          <input
            class="rounded-md border border-gray-400"
            formControlName="title" />
        </div>
        <div>
          salary:
          <input
            class="rounded-md border border-gray-400"
            formControlName="salary" />
        </div>
      </div>
      <button class="w-fit border p-2">Submit</button>
    </form>
  `,
  host: {
    class: 'block border border-gray-500 p-4 pt-10 m-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent {
  userStore = inject(UserStore);

  address = new FormGroup({
    street: new FormControl(this.userStore.address().street, {
      nonNullable: true,
    }),
    zipCode: new FormControl(this.userStore.address().zipCode, {
      nonNullable: true,
    }),
    city: new FormControl(this.userStore.address().city, {
      nonNullable: true,
    }),
  });

  job = new FormGroup({
    title: new FormControl(this.userStore.job().title, { nonNullable: true }),
    salary: new FormControl(this.userStore.job().salary, {
      nonNullable: true,
    }),
  });

  form = new FormGroup({
    name: new FormControl(this.userStore.name(), { nonNullable: true }),
    note: new FormControl(this.userStore.note(), { nonNullable: true }),
    address: this.address,
    job: this.job,
  });

  submit() {
    this.userStore.update(this.form.getRawValue());
  }
}
