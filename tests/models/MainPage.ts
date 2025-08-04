import { Page } from '@playwrigth/test';

class MainPage {
    readonly page: Page:
    readonly elements: Elements[];

    constructor{page: Page} {
        this.page = page;
        this.elements = [

        ];
    }
    async openMainPage() {
        await this.page.goto()
    }
}