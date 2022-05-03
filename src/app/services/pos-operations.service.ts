import { PosElogHandler, PosInjectorService } from 'dotsdk';
import { ApplicationSettingsService } from './app-settings.service';
import { log } from '../helpers/log.helper';
import { Injectable } from '@angular/core';
import { DynamicContentRef } from './dynamic-content/models/dynamic-content.ref';
import { DynamicContentService } from './dynamic-content/dynamic-content.service';
import { DotCdkTranslatePipe } from '../pipes/dot-translate.pipe';
import { InfoDialogComponent } from '../components/info-dialog/info-dialog.component';

@Injectable({
    providedIn: 'root'
  })

export class PosOperationsService {

  constructor(
    protected appSettingsService: ApplicationSettingsService,
    protected translatePipe: DotCdkTranslatePipe,
    protected dynamicContentService: DynamicContentService) {
  }

  public async sendVoidOrderToPOS(showLoadingPopup: boolean = true): Promise<boolean> {
    log('void order sent: ', PosElogHandler.getInstance().posConfig);
    const loadingPopup = showLoadingPopup ? this.showPosLoadingPopupOverlay() : null;
    const voidOrderResponse = await PosInjectorService.getInstance()
      .voidOrderOnPos(this.appSettingsService.posInjectorPath, PosElogHandler.getInstance().posConfig)
      .catch(e => null);
    if (showLoadingPopup) { loadingPopup.close(); }
    log('void order response: ', voidOrderResponse);
    // tslint:disable-next-line: triple-equals
    return (voidOrderResponse && voidOrderResponse.ReturnCode == 0);
  }

  public async sendUnlockOrderToPOS(showLoadingPopup: boolean = true) {
    log('unlock order sent: ', PosElogHandler.getInstance().posConfig);
    const loadingPopup = showLoadingPopup ? this.showPosLoadingPopupOverlay() : null;
    const unlockOrderResponse = await PosInjectorService.getInstance()
      .unlockOrderOnPos(this.appSettingsService.posInjectorPath, PosElogHandler.getInstance().posConfig)
      .catch(e => null);
    if (showLoadingPopup) { loadingPopup.close(); }
    log('unlock order response: ', unlockOrderResponse);
  }

  private showPosLoadingPopupOverlay(): DynamicContentRef {
    return this.dynamicContentService.openContent(InfoDialogComponent, {
      title: this.translatePipe.transform('2020121702'), // please wait
      buttonText: this.translatePipe.transform('24'),
      hideFooterActions: true,
    });
  }
}
