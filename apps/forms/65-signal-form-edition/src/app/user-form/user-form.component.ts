import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  disabled,
  form,
  FormField,
  FormRoot,
  min,
  required,
} from '@angular/forms/signals';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { FakeBackendService } from '../fake-backend.service';
import { User } from '../user.model';
import { ValidationComponent } from '../validation/validation.component';

type UserData = {
  firstname: string;
  lastname: string;
  age: number | null;
  grade: number | null;
};

@Component({
  selector: 'app-user-form',
  imports: [FormField, FormRoot, ValidationComponent],
  templateUrl: './user-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent {
  public readonly id = input<string>();

  protected readonly userResource = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params: { id } }) => {
      return id ? this.backend.getUser(Number(id)) : of(undefined);
    },
    defaultValue: undefined,
  });
  private readonly _initialData: UserData = {
    firstname: '',
    lastname: '',
    age: null,
    grade: null,
  };
  private readonly _formModel = linkedSignal({
    source: this.userResource.value,
    computation: (domainModel) =>
      domainModel
        ? this.mapDomainModelToUserFormData(domainModel)
        : this._initialData,
  });

  protected readonly userForm = form(
    this._formModel,
    (schemaPath) => {
      disabled(schemaPath, () => this.userResource.isLoading());
      required(schemaPath.firstname, { message: 'Firstname is required' });
      required(schemaPath.lastname, { message: 'Lastname is required' });
      required(schemaPath.age, { message: 'Age is required' });
      min(schemaPath.age, 0, { message: 'Age must be positive' });
      required(schemaPath.grade, { message: 'Grade is required' });
    },
    {
      submission: {
        action: async () => {
          if (this.userForm().valid()) {
            const userData = this.mapUserFormValueToUserData(
              this.userForm().value(),
            );
            const userValue = this.userResource.value();

            const obs = userValue
              ? this.backend.updateUser({
                  ...userData,
                  id: userValue.id,
                })
              : this.backend.addUser(userData);
            obs.subscribe(() => {
              this.router.navigate(['/']);
            });
          }
        },
      },
    },
  );

  private backend = inject(FakeBackendService);
  private router = inject(Router);

  public onCancel(): void {
    this.router.navigate(['/']);
  }

  private mapDomainModelToUserFormData(domainModel: User): UserData {
    return {
      firstname: domainModel.firstname,
      lastname: domainModel.lastname,
      age: domainModel.age,
      grade: domainModel.grade,
    };
  }

  private mapUserFormValueToUserData(
    userFormValue: UserData,
  ): Omit<User, 'id'> {
    return {
      firstname: userFormValue.firstname,
      lastname: userFormValue.lastname,
      age: userFormValue.age ?? 0,
      grade: userFormValue.grade ?? 0,
    };
  }
}
