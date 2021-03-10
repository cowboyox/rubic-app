import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

export const PROJECT_PARTS = {
  TEST: {
    '^/.+$': 'devswaps.mywish.io'
  },
  PROD: {
    '^/$': 'swaps.network',
    '^/.+$': 'trades.swaps.network',
    from: 'swaps.network'
  },
  LOCAL: {
    '^/.+$': 'local.devswaps.mywish.io'
  }
};

let currMode = 'PROD';
Object.entries(PROJECT_PARTS).forEach(([projectPartName, projectPartValue]: [string, any]) => {
  Object.entries(projectPartValue).forEach(([, hostName]: [string, string]) => {
    if (location.hostname === hostName) {
      currMode = projectPartName;
    }
  });
});

export const MODE = currMode;

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/main-page/main-page.module').then(m => m.MainPageModule)
  },
  {
    path: 'bridge',
    loadChildren: () =>
      import('./features/bridge-page/bridge-page.module').then(m => m.BridgePageModule)
  },
  {
    path: 'about',
    loadChildren: () =>
      import('./features/features-page/features-page.module').then(m => m.FeaturesPageModule)
  },
  {
    path: 'team',
    loadChildren: () => import('./features/team-page/team-page.module').then(m => m.TeamPageModule)
  },
  {
    path: 'public-v3/:public_link',
    redirectTo: '/trades/public-v3/:public_link'
  },
  {
    path: 'contracts',
    redirectTo: '/trades/contracts'
  },
  {
    path: 'trades',
    loadChildren: () => import('./features/trades/trades.module').then(m => m.TradesModule)
  },
  {
    path: 'faq',
    loadChildren: () => import('./features/faq-page/faq-page.module').then(m => m.FaqPageModule)
  },
  {
    path: 'token-sale',
    loadChildren: () =>
      import('./features/token-sale-page/token-sale-page/token-sale-page.module').then(
        m => m.TokenSalePageModule
      )
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      scrollPositionRestoration: 'enabled',
      relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
