import { TestBed } from '@angular/core/testing';

import { PancakeSwapService } from './pancake-swap.service';

describe('PancakeSwapService', () => {
  let service: PancakeSwapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PancakeSwapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
