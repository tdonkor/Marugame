import { DotAvailabilityService, DotButton, DotButtonType, DotCatalogLoader, DotCombosCatalogLoader } from 'dotsdk';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'catalogButtonAvailability',
})
export class CatalogAvailabilityPipe implements PipeTransform {
  constructor() {}

  /** DF-3938 */
  public transform(buttons: DotButton[]): DotButton[] {

    let buttonsToReturn: DotButton[] = [];

    if (buttons?.length) {


      for(const button of buttons) {
        if(this.evaluateButtonOwnAvlb(button)) {
          switch(button.ButtonType){
            case DotButtonType.ITEM_BUTTON:
              if(this.evaluateCatalogItemButtonAvailability(button)){
                buttonsToReturn.push(button);
              }
              break;
    
            case DotButtonType.MENU_BUTTON:
              if(this.evaluateCatalogMenuButtonAvailability(button)){
                buttonsToReturn.push(button);
              }
              break;
            
            default:
              buttonsToReturn.push(button);
          }
        }
        
      }


    }
    return buttonsToReturn;
  }

  private evaluateButtonOwnAvlb(button: DotButton): boolean {
    return DotAvailabilityService.getInstance().isButtonAvailable(button);
  }


  private evaluateCatalogItemButtonAvailability(button: DotButton): boolean {
    const itemsCatalog = DotCatalogLoader.getInstance().loadedModel;
    const equivalentCatalogItem = itemsCatalog?.Buttons.find(catalogItem => catalogItem.Link === button.Link)

    if(!itemsCatalog || !equivalentCatalogItem){
      return true;
    }

    

    return this.evaluateButtonOwnAvlb(equivalentCatalogItem);
  }

  private evaluateCatalogMenuButtonAvailability(button: DotButton): boolean {
    const menuCatalog = DotCombosCatalogLoader.getInstance().loadedModel;
    const equivalentCatalogMenu = menuCatalog?.Buttons.find(catalogMenu => catalogMenu.Link === button.Link)

    if(!menuCatalog || !equivalentCatalogMenu){
      return true;
    }

    return this.evaluateButtonOwnAvlb(equivalentCatalogMenu);
  }
}
