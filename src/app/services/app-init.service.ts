import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { AtpEnvironmentService, IAppDetails, FilesLoaderService, PosRefintService, SDK_VERSION, AppInitStep, AppInitStepProgressFlag } from 'dotsdk';
import { ApplicationSettingsService } from './app-settings.service';
import { CheckoutService } from './checkout.service';
import { ContentService } from './content.service';
import { InactivityService } from './inactivity.service';
import { SessionEndType, SessionService } from './session.service';
import { TranslationsService } from './translations/translations.service';
import { environment } from '../../environments/environment';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AppInitService {

  constructor(
    @Inject(DOCUMENT) private _document: any,
    private meta: Meta,
    protected contentService: ContentService,
    protected appSettings: ApplicationSettingsService,
    protected translationsService: TranslationsService,
    protected inactivityService: InactivityService,
    protected checkoutService: CheckoutService,
    protected sessionService: SessionService
  ) {
    this.sessionService.onRestartSession.subscribe(async (status: SessionEndType) => {
      console.clear();
      this.setMetaTags();
    });
  }
  public async initialize() {
    if (environment.production) {
      AtpEnvironmentService.getInstance().hideCloseButton().catch((x) => null);
    }
    await this.openDeveloperToolsOnStartUp();
    await this.contentService.initialize(this.appSettings.bridgeAssetsPath);
    this.translationsService.initialize(this.appSettings.languages);
    this._document.documentElement.lang = this.appSettings.defaultLanguage;
    this.inactivityService.init();
    AtpEnvironmentService.getInstance()
      .onBundleSettingsChanged()
      .subscribe((x) => {
        // if between sessions ATP notifies SDK of new Bundle Settings onBundleSettingsChanged() will fire immediately
        // if order is ongoing and ATP notifies SDK of new Bundle Settings onBundleSettingsChanged() will fire only after DotSessionService.endSession()
        this.appSettings.mapSettings();
      });

    FilesLoaderService.getInstance()
      .loadingProgress
      .pipe(distinctUntilChanged())
      .subscribe(async (loadingStep: AppInitStep) => {
        // if between sessions and SDK is notified of new data arrival it start loading data immediately
        // if order is ongoing and SDK is notified of new data arrival it will delay loading of data until DotSessionService.endSession()
        if(loadingStep.progressFlag !== AppInitStepProgressFlag.LOADING_FINISHED) {
          this.contentService.dataLoadingState.next(true);
        } else {
          await this.contentService.initialize(this.appSettings.bridgeAssetsPath);
          this.contentService.dataLoadingState.next(false);
        }
        
      });

    this.setMetaTags();
  }
  public async setMetaTags() {
    const appDetails = await AtpEnvironmentService.getInstance()
      .getAppDetails()
      .catch((e) => null);
    const refint = PosRefintService.getInstance()._refInt;
    this.meta.addTags([
      { name: 'app-version', content: appDetails?.AppVersion },
      { name: 'sdk-version', content: SDK_VERSION },
    ]);
    if (refint) {
      this.meta.updateTag({ name: 'refint', content: refint.toString() });
    }
  }

  protected async openDeveloperToolsOnStartUp() {
    if (AtpEnvironmentService.getInstance().mBirdIsConnected) {
      const appDetails: IAppDetails = await AtpEnvironmentService.getInstance()
        .getAppDetails()
        .catch((e) => null);
      const isBetaApp = appDetails ? appDetails.IsBeta : true;
      if (isBetaApp  && !environment.production) {
        AtpEnvironmentService.getInstance()
          .openDeveloperTools()
          .catch((e) => null);
      }
    }
  }
}
