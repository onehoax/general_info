import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import type { SignInResponse } from "../domain/sign-in-response.interface";
import { SignInRepository } from "../domain/sign-in.repository";
import { HttpErrorResponse } from "@angular/common/http";
import { MessageService } from "primeng/api";
import { LocalStorageService } from "@lib/services/local-storage.service";

@Injectable({ providedIn: "root" })
export class SignInService {
  public constructor(
    private readonly signInRepository: SignInRepository,
    private readonly messageService: MessageService,
    private readonly localStorageService: LocalStorageService,
  ) {}

  public signIn(email: string, password: string): Observable<SignInResponse> {
    const currentUser = this.signInRepository.signIn(email, password);

    currentUser.subscribe({
      next: (response: SignInResponse): void => {
        this.localStorageService.setAccessToken(response.data.accessToken);
        this.localStorageService.setLanguage(response.data.language);
        this.localStorageService.setUserId(response.data.id);
      },
      error: (httpError: HttpErrorResponse): void => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: httpError.error.message,
        });
      },
    });

    return currentUser;
  }
}
