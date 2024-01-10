import { Injectable } from "@angular/core";
import { environment } from "@env/environment";
import { HttpClient } from "@angular/common/http";
import type { Observable } from "rxjs";
import type { SignInRepository } from "../domain/sign-in.repository";
import type { SignInResponse } from "../domain/sign-in-response.interface";

@Injectable()
export class ApiSignInRepository implements SignInRepository {
  public SIGN_IN_ENDPOINT: string = `${environment.API_URL}/api/auth/sign-in`;

  public constructor(private readonly httpClient: HttpClient) {}

  public signIn(username: string, password: string): Observable<SignInResponse> {
    return this.httpClient.post<SignInResponse>(this.SIGN_IN_ENDPOINT, {
      username,
      password,
    });
  }
}
