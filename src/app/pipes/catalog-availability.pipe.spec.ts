import { DotAvailability, DotButton, DotCatalog, DotCatalogLoader, DotCombosCatalog, DotCombosCatalogLoader, DotPage } from 'dotsdk';
import { CatalogAvailabilityPipe } from './catalog-availability.pipe';

describe('CatalogAvailabilityPipe', () => {


  let inputButtons: DotButton[];

  let itemButton: DotButton, menuButton: DotButton, pageButton: DotButton;

  const pipe = new CatalogAvailabilityPipe();
  const pipeTransform: (buttons: DotButton[])=>DotButton[] = pipe.transform.bind(pipe);

  beforeEach(() => {

    DotCatalogLoader.getInstance()['_loadedModel'] = {
      Buttons: [
        new DotButton({
          Caption: 'Ice Cream Chocolat',
          ButtonType: 2,
          Link: "1",
          Price: 260,
          Order: 0,
          MinPrice: 260
        })
      ]
    } as DotCatalog;

    DotCombosCatalogLoader.getInstance()['_loadedModel'] = {
      Buttons: [
        new DotButton({
          Caption: "Menu Cool Kids Hamburger",
          ButtonType: 1,
          Link: "2",
          ComboPage: {
            ID: 11002,
            Combos: [
              {
                PageType: "Combo",
                ComboStepID: "1100204",
                ComboID: "11002",
                ComboStepIndex: 1100204,
                Buttons: [new DotButton({})],
                ID: 0,
                ComboStepName: "- Choix Petites Faims Hamburger -",
                ComboStepType: "ComboStep"
              }
            ]
          },
          Order: 2,
          MinPrice: 470,
          StartSize: "-1",
          DefaultSize: "-1",
        })
      ]
    } as DotCombosCatalog;

    itemButton = new DotButton({
      Caption: 'Ice Cream Chocolat',
      ButtonType: 2,
      Link: "1",
      Price: 260,
      Order: 0,
      MinPrice: 260
    });
  
    menuButton =  new DotButton({
      Caption: "Menu Cool Kids Hamburger",
      ButtonType: 1,
      Link: "2",
      ComboPage: {
        ID: 11002,
        Combos: [
          {
            PageType: "Combo",
            ComboStepID: "1100204",
            ComboID: "11002",
            ComboStepIndex: 1100204,
            Buttons: [new DotButton({})],
            ID: 0,
            ComboStepName: "- Choix Petites Faims Hamburger -",
            ComboStepType: "ComboStep"
          }
        ]
      },
      Order: 2,
      MinPrice: 470,
      StartSize: "-1",
      DefaultSize: "-1",
    });
  
    pageButton = new DotButton({
      Caption: "A page",
      ButtonType: 0,
      Link: "3",
      Page: new DotPage({
        Buttons: [
          new DotButton({Caption: "Button on a page"})
        ]
      })
    });

    inputButtons = [];
  });

  it('should return an empty array if no input given', () => {
    inputButtons = [itemButton, menuButton, pageButton];
    const filteredButtons = pipeTransform(null);
    expect(filteredButtons instanceof Array).toBe(true);
    expect(filteredButtons.length).toBe(0);
  })

  it('should eliminate all input buttons that are not available due to their own Avlb property', () => {
    itemButton.Avlb = new DotAvailability({ DOW: '0' }) // Item Link: 1
    menuButton.Avlb =  new DotAvailability({ DOW: '127' }); // Menu Link: 2
    pageButton.Avlb =  new DotAvailability({ DOW: '0' }); // Page Link: 3

    inputButtons = [itemButton, menuButton, pageButton];

    let filteredButtons = pipeTransform(inputButtons);

    expect(filteredButtons.contains(itemButton)).toBe(false);
    expect(filteredButtons.contains(menuButton)).toBe(true);
    expect(filteredButtons.contains(pageButton)).toBe(false);

    menuButton.Avlb =  new DotAvailability({ DOW: '0' }); // Menu Link: 2
    filteredButtons = pipeTransform(inputButtons);
    expect(filteredButtons.contains(menuButton)).toBe(false);

  })

  it('should pass all available (their own Avlb) buttons other than Items or Menus', () => {

    pageButton.Avlb =  new DotAvailability({ DOW: '127' }); // Page Link: 3

    inputButtons = [pageButton];

    let filteredButtons = pipeTransform(inputButtons);
    expect(filteredButtons.contains(pageButton)).toBe(true);

    pageButton.Avlb =  new DotAvailability({ DOW: '0' }); // Page Link: 3
    filteredButtons = pipeTransform(inputButtons)
    expect(filteredButtons.contains(pageButton)).toBe(false);

  })

  it('should pass all available (their own Avlb) item buttons when no items catalog is present', () => {

    DotCatalogLoader.getInstance()['_loadedModel'] = undefined;

    itemButton.Avlb = new DotAvailability({ DOW: '127' }) // Item Link: 1

    inputButtons = [itemButton];

    let filteredButtons = pipeTransform(inputButtons);
    expect(filteredButtons.contains(itemButton)).toBe(true);
  })

  it('should pass all available (their own Avlb) menu buttons when no menu catalog is present', () => {

    DotCombosCatalogLoader.getInstance()['_loadedModel'] = undefined;

    menuButton.Avlb =  new DotAvailability({ DOW: '127' }); // Menu Link: 2

    inputButtons = [ menuButton];

    let filteredButtons = pipeTransform(inputButtons);
    expect(filteredButtons.contains(menuButton)).toBe(true);
  })

  it('should block all available (their own Avlb) item buttons when equivalent items are not found in catalog', () => {

    DotCatalogLoader.getInstance()['_loadedModel'] = {Buttons: []};

    itemButton.Avlb = new DotAvailability({ DOW: '127' }) // Item Link: 1

    inputButtons = [itemButton];

    let filteredButtons = pipeTransform(inputButtons);
    expect(filteredButtons.contains(itemButton)).toBe(true);
  })

  it('should block all available (their own Avlb) menu buttons when equivalent menus are not found in menu catalog', () => {

    DotCombosCatalogLoader.getInstance()['_loadedModel'] = {Buttons: []};

    menuButton.Avlb =  new DotAvailability({ DOW: '127' }); // Menu Link: 2

    inputButtons = [ menuButton];

    let filteredButtons = pipeTransform(inputButtons);
    expect(filteredButtons.contains(menuButton)).toBe(true);
  })

  it('should block all available (their own Avlb) item buttons when the equivalent catalog items are evaluated as unavailable (catalog item Avlb)', () => {

    const catalogItem = DotCatalogLoader.getInstance().loadedModel.Buttons[0]; // Item Link: 1

    catalogItem.Avlb = new DotAvailability({ DOW: '127' })

    inputButtons = [itemButton];

    let filteredButtons = pipeTransform(inputButtons);
    expect(filteredButtons.contains(itemButton)).toBe(true);

    catalogItem.Avlb = new DotAvailability({ DOW: '0' })
    filteredButtons = pipeTransform(inputButtons);
    expect(filteredButtons.contains(itemButton)).toBe(false);
  })

  it('should block all available (their own Avlb) menu buttons when the equivalent combos catalog menus are evaluated as unavailable (combo catalog menu Avlb)', () => {

    const combosCatalogItem = DotCombosCatalogLoader.getInstance().loadedModel.Buttons[0]; // Item Link: 2

    combosCatalogItem.Avlb = new DotAvailability({ DOW: '127' })

    inputButtons = [combosCatalogItem];

    let filteredButtons = pipeTransform(inputButtons);
    expect(filteredButtons.contains(combosCatalogItem)).toBe(true);

    combosCatalogItem.Avlb = new DotAvailability({ DOW: '0' }) // Item Link: 1
    filteredButtons = pipeTransform(inputButtons);
    expect(filteredButtons.contains(combosCatalogItem)).toBe(false);
  })
})