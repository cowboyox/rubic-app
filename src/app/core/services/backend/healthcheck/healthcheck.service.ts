import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HealthcheckService {
  constructor(private httpClient: HttpClient) {}

  public healthCheck(): Promise<boolean> {
    return new Promise(resolve => {
      this.httpClient
        .get(`${environment.apiBaseUrl}/healthcheck/`, { observe: 'response' })
        .subscribe(
          // eslint-disable-next-line no-magic-numbers
          response => resolve(response.status === 200),
          () => resolve(false)
        );
    });
  }
}
