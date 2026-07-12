import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { UserData } from './auth';

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  updateProfile(payload: UpdateProfilePayload): Observable<UserData> {
    return this.http.patch<UserData>(`${environment.apiUrl}/users/profile`, payload);
  }
}
