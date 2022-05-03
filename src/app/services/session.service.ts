import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import {  PosServingLocation, DotSessionService, PosElogHandler, PosPaidState, OMSEventsFacade, DotSessionState, PosRefintService } from 'dotsdk';
import { Observable, Subject } from 'rxjs';
import { disableAdaMode } from '../helpers/ada.helper';
import { AllergensService } from './allergens.service';
import { ApplicationSettingsService } from './app-settings.service';
import { BasketService } from './basket.service';
import { PromosService } from './promos.service';
import { TranslationsService } from './translations/translations.service';


export enum SessionEndType {
  CANCEL_ORDER = 'CANCEL_ORDER',
  APP_TIMEOUT = 'APP_TIMEOUT',
  ORDER_SUCCESS = 'ORDER_SUCCESS',
  ORDER_FAIL = 'ORDER_FAIL',
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  protected _onRestartSession: Subject<SessionEndType> = new Subject();


  public get onRestartSession(): Observable<SessionEndType> {
    return this._onRestartSession.asObservable();
  }

  public get serviceType(): PosServingLocation {
    return DotSessionService.getInstance().currentPosServingLocation;
  }

  constructor(protected translationService: TranslationsService,
              protected appSettings: ApplicationSettingsService,
              protected allergensService: AllergensService,
              protected basketService: BasketService,
              protected promosService: PromosService,
              @Inject(DOCUMENT) private _document: any) {}

  public async restartSession(type: SessionEndType) {

    if (this.appSettings.enableOMSModule) {
      this.sendOMSUpdates(type);
    }
    this._onRestartSession.next(type);
    DotSessionService.endSession();
    this.basketService.resetBasket();
    this.translationService.setCurrentLanguage(this.appSettings.defaultLanguage);
    this.allergensService.resetAllergens();
    const adaClass = this.appSettings.enabledTouchlessDM ? 'ada--touchless' : 'ada';
    if (this._document.documentElement.classList.contains(adaClass)) {
      disableAdaMode(adaClass);
    }
    this.promosService.resetPromos();
  }

  public setServiceType(type: PosServingLocation) {
    DotSessionService.startSession(type);
  }

  protected sendOMSUpdates(status: SessionEndType) {
    return new Promise<void>(async (resolve, reject) => {
      if (!this.appSettings.enableOMSModule) {
        resolve();
        return;
      }
      const orderTotal = PosElogHandler.getInstance().posConfig.posHeader?.amounts?.amountsTotalPaid;
      const amount = orderTotal && orderTotal > 0 ? orderTotal : this.basketService.totalPrice;
      const isPaid = PosElogHandler.getInstance().posConfig.posHeader?.amounts?.tenders?.reduce((acc, t) => {
        if (t.paid === PosPaidState.PAID) {
          return acc + t.paidAmount;
        }
        return acc;
      }, 0) >= orderTotal;
      const orderPosNumber = PosElogHandler.getInstance().posConfig.posHeader.orderPosNumber;
      const refint = PosRefintService.getInstance()._refInt;
      const serviceType = DotSessionService.getInstance().currentPosServingLocation;
      const orderStartTime = PosElogHandler.getInstance().posConfig.posHeader.orderStartTime;
      const firstItemAddedTime = PosElogHandler.getInstance().posConfig.posHeader.firstItemAddedTime;
      if (status !== SessionEndType.ORDER_SUCCESS) {
        try {
          await new OMSEventsFacade().recallEvent(amount, false, null, orderPosNumber, refint, serviceType, orderStartTime, firstItemAddedTime).toPromise();
          await new OMSEventsFacade().cancelEvent(amount, isPaid, null, orderPosNumber, refint, serviceType, orderStartTime, firstItemAddedTime).toPromise();
          resolve();
        } catch (e) {
          reject(e);
        }
      } else {
        try {
          isPaid ?
          await new OMSEventsFacade().finishEvent(amount, isPaid, null, orderPosNumber, refint, serviceType, orderStartTime, firstItemAddedTime).toPromise() :
          resolve();
        } catch (e) {
          reject(e);
        }
      }
    });
  }
}
