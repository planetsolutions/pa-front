import { RussianIaPage } from './app.po';

describe('russian-ia App', () => {
  let page: RussianIaPage;

  beforeEach(() => {
    page = new RussianIaPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
